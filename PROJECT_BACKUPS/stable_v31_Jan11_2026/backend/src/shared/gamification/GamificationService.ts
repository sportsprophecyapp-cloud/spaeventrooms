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
    async awardPoints(userId: number, points: number): Promise<{ oldLevel: number; newLevel: number; earnedPoints: number }> {
        // 1. Get or create user stats
        let statsResult = await query(
            'SELECT * FROM user_stats WHERE user_id = $1',
            [userId]
        );

        if (statsResult.rows.length === 0) {
            statsResult = await query(
                'INSERT INTO user_stats (user_id, total_points, current_level, points_to_next_level) VALUES ($1, 0, 1, $2) RETURNING *',
                [userId, this.LEVEL_THRESHOLDS[1]]
            );
        }

        const stats = statsResult.rows[0];
        const oldLevel = stats.current_level;
        const newTotalPoints = stats.total_points + points;

        // 2. Calculate new level
        let newLevel = oldLevel;
        for (let i = this.LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
            if (newTotalPoints >= this.LEVEL_THRESHOLDS[i]) {
                newLevel = i + 1;
                break;
            }
        }

        const pointsToNext = this.LEVEL_THRESHOLDS[newLevel] ? this.LEVEL_THRESHOLDS[newLevel] - newTotalPoints : 0;

        // 3. Update stats
        await query(
            'UPDATE user_stats SET total_points = $1, current_level = $2, points_to_next_level = $3, updated_at = CURRENT_TIMESTAMP WHERE user_id = $4',
            [newTotalPoints, newLevel, pointsToNext, userId]
        );

        // 4. Trigger badge checks
        await this.checkBadges(userId);

        return { oldLevel, newLevel, earnedPoints: points };
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
                    // TODO: Emit socket event for real-time badge notification
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
        const badges = await query(`
            SELECT b.*, ub.earned_at 
            FROM user_badges ub
            JOIN badges b ON ub.badge_id = b.id
            WHERE ub.user_id = $1
            ORDER BY ub.earned_at DESC
        `, [userId]);

        return {
            stats: stats.rows[0] || { total_points: 0, current_level: 1, points_to_next_level: 500 },
            badges: badges.rows
        };
    }
}

export const gamificationService = GamificationService.getInstance();
