import { query } from '../database';

export class GamificationService {
    private static instance: GamificationService;

    // Level thresholds (cumulative points)
    private readonly LEVEL_THRESHOLDS = [0, 500, 1500, 3000, 6000, 10000, 20000];

    static getInstance(): GamificationService {
        if (!GamificationService.instance) {
            GamificationService.instance = new GamificationService();
        }
        return GamificationService.instance;
    }

    /**
     * Award points to a user and check for level ups
     */
    /**
     * Centralized Reward Engine
     * Updates tokens, tickets, and XP atomically and logs the transaction.
     */
    async awardReward(userId: number, options: {
        tokens?: number;
        tickets?: number;
        xp?: number;
        type: string;
        description: string;
    }): Promise<{ newBalance: number; newTickets: number; newXp: number; newLevel: number }> {
        const { tokens = 0, tickets = 0, xp = 0, type, description } = options;

        await query('BEGIN');
        try {
            // 1. Update user record
            const result = await query(`
                UPDATE users 
                SET token_balance = token_balance + $1,
                    total_tickets = total_tickets + $2,
                    total_points = total_points + $3
                WHERE id = $4
                RETURNING token_balance, total_tickets, total_points, current_level
            `, [tokens, tickets, xp, userId]);

            if (result.rows.length === 0) throw new Error('User not found');
            const user = result.rows[0];

            // 2. Log transaction
            if (tokens !== 0 || tickets !== 0 || xp !== 0) {
                await query(`
                    INSERT INTO token_transactions (user_id, amount, type, description)
                    VALUES ($1, $2, $3, $4)
                `, [userId, tokens, type, description]);
            }

            // 3. Level up check
            let newLevel = user.current_level;
            const currentXp = user.total_points;
            for (let i = this.LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
                if (currentXp >= this.LEVEL_THRESHOLDS[i]) {
                    newLevel = i + 1;
                    break;
                }
            }

            if (newLevel !== user.current_level) {
                await query('UPDATE users SET current_level = $1 WHERE id = $2', [newLevel, userId]);
            }

            await query('COMMIT');

            // 4. Badge check (async)
            this.checkBadges(userId);

            return {
                newBalance: user.token_balance,
                newTickets: user.total_tickets,
                newXp: user.total_points,
                newLevel
            };
        } catch (err) {
            await query('ROLLBACK');
            throw err;
        }
    }

    /**
     * Award points to a user and check for level ups (Legacy support)
     */
    async awardPoints(userId: number, points: number) {
        return this.awardReward(userId, {
            xp: points,
            type: 'participation',
            description: 'XP Earned'
        });
    }

    /**
     * Unified Daily Login Handler
     */
    async handleDailyLogin(userId: number): Promise<{
        alreadyClaimed: boolean;
        streak: number;
        reward: { tokens: number; tickets: number };
        newBalances: any;
    }> {
        // 1. Get current streak info
        const userResult = await query(
            'SELECT consecutive_login_days, last_login_at FROM users WHERE id = $1',
            [userId]
        );
        const user = userResult.rows[0];
        if (!user) throw new Error('User not found');

        const now = new Date();
        const lastLogin = user.last_login_at ? new Date(user.last_login_at) : null;

        let newStreak = user.consecutive_login_days || 0;
        let alreadyClaimed = false;

        if (lastLogin) {
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const last = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
            const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
                alreadyClaimed = true;
            } else if (diffDays === 1) {
                newStreak += 1;
            } else {
                newStreak = 1; // Reset streak
            }
        } else {
            newStreak = 1; // First login
        }

        if (alreadyClaimed) {
            return { alreadyClaimed: true, streak: newStreak, reward: { tokens: 0, tickets: 0 }, newBalances: null };
        }

        // 2. Calculate rewards
        let tokens = 5; // Standard 5 tokens
        let tickets = 0;

        // Streak bonuses
        if (newStreak % 7 === 0) tokens += 25;
        if (newStreak % 30 === 0) tokens += 100;

        // 3. Apply reward
        const balances = await this.awardReward(userId, {
            tokens,
            tickets,
            type: 'daily_login',
            description: `Day ${newStreak} Login Reward`
        });

        // 4. Update streak and timestamp (already in transaction in awardReward? No, let's do manually)
        await query(
            'UPDATE users SET consecutive_login_days = $1, last_login_at = $2 WHERE id = $3',
            [newStreak, now, userId]
        );

        // 5. Trigger Badge Service milestones
        const { BadgeService } = require('./BadgeService');
        await BadgeService.checkStreakMilestones(userId, newStreak);

        return {
            alreadyClaimed: false,
            streak: newStreak,
            reward: { tokens, tickets },
            newBalances: balances
        };
    }

    /**
     * Check and award badges based on user activity
     */
    async checkBadges(userId: number): Promise<void> {
        try {
            // Get all badges the user doesn't have yet
            const availableBadges = await query(`
                SELECT b.* FROM badges b
                LEFT JOIN user_badges ub ON b.id = ub.badge_id AND ub.user_id = $1
                WHERE ub.badge_id IS NULL
            `, [userId]);

            for (const badge of availableBadges.rows) {
                let earned = false;

                if (badge.requirement_type === 'submissions') {
                    const count = await query('SELECT COUNT(*) FROM prediction_submissions WHERE user_id = $1', [userId]);
                    if (parseInt(count.rows[0].count) >= badge.requirement_value) earned = true;
                } else if (badge.requirement_type === 'wins') {
                    const count = await query('SELECT COUNT(*) FROM prediction_submissions WHERE user_id = $1 AND is_correct = true', [userId]);
                    if (parseInt(count.rows[0].count) >= badge.requirement_value) earned = true;
                }

                if (earned) {
                    await query(
                        'INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                        [userId, badge.id]
                    );
                    console.log(`🎖️ User ${userId} earned badge: ${badge.name}`);
                }
            }
        } catch (err) {
            console.error('Error checking badges:', err);
        }
    }

    /**
     * Get user profile gamification data
     */
    async getUserStats(userId: number) {
        const stats = await query('SELECT * FROM user_stats WHERE user_id = $1', [userId]);
        const tokensResult = await query('SELECT token_balance, total_tickets, total_points, current_level FROM users WHERE id = $1', [userId]);
        const badges = await query(`
            SELECT b.*, ub.earned_at 
            FROM user_badges ub
            JOIN badges b ON ub.badge_id = b.id
            WHERE ub.user_id = $1
            ORDER BY ub.earned_at DESC
        `, [userId]);

        const user = tokensResult.rows[0] || { token_balance: 0, total_tickets: 0, total_points: 0, current_level: 1 };

        return {
            stats: {
                total_points: user.total_points,
                current_level: user.current_level,
                tokens: user.token_balance,
                tickets: user.total_tickets
            },
            badges: badges.rows
        };
    }
}

export const gamificationService = GamificationService.getInstance();
