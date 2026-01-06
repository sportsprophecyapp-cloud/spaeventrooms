import { Request, Response } from 'express';
import { query as dbQuery } from '../database';
import { AuthRequest } from '../auth/middleware';

interface CosmeticRow {
    id: string;
    name: string;
    type: string;
    cost: number;
    asset_url: string;
    description: string;
}

interface UserCosmeticRow {
    cosmetic_id: string;
}

// GET /api/gamification/me
export const handleGetMe = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

        const userResult = await dbQuery(
            `SELECT token_balance, total_points, current_level FROM users WHERE id = $1`,
            [userId]
        );

        if (userResult.rows.length === 0) return res.status(404).json({ success: false, error: 'User not found' });

        const badgesResult = await dbQuery(
            `SELECT c.id, c.name, c.icon, c.description, uc.acquired_at 
             FROM cosmetics c 
             JOIN user_cosmetics uc ON c.id = uc.cosmetic_id 
             WHERE uc.user_id = $1 AND c.type = 'badge'`,
            [userId]
        );

        res.json({
            success: true,
            stats: {
                total_points: userResult.rows[0].total_points || 0,
                current_level: userResult.rows[0].current_level || 1,
                token_balance: userResult.rows[0].token_balance || 0,
                points_to_next_level: 500 // Threshold example
            },
            badges: badgesResult.rows
        });
    } catch (error) {
        console.error('Error fetching user gamification stats:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// GET /api/gamification/leaderboard
export const handleGetLeaderboard = async (req: Request, res: Response) => {
    try {
        const { sport } = req.query;
        // In a real scenario, you might filter by sport. For now, we return global rankings.
        const leaderboardResult = await dbQuery(
            `SELECT username, total_points as points, current_level, 
             (SELECT COUNT(*) FROM soccer_predictions WHERE user_id = users.id AND result = 'correct') as correct_predictions
             FROM users 
             ORDER BY total_points DESC 
             LIMIT 100`
        );

        const leaderboard = leaderboardResult.rows.map((row, index) => ({
            rank: index + 1,
            username: row.username,
            points: row.points || 0,
            correct_predictions: parseInt(row.correct_predictions) || 0,
            level: row.current_level
        }));

        res.json({ success: true, leaderboard });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// POST /api/gamification/daily-login
export const handleDailyLogin = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        // Get current streak
        const streakResult = await dbQuery(
            `SELECT * FROM user_streaks WHERE user_id = $1`,
            [userId]
        );

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let streak = streakResult.rows[0];
        let tokensEarned = 5; // Base daily login reward
        let bonusTriggered = false;
        let bonusMessage = '';

        if (!streak) {
            // First login ever
            await dbQuery(
                `INSERT INTO user_streaks (user_id, current_streak, last_login_date, created_at)
         VALUES ($1, 1, $2, NOW())`,
                [userId, today]
            );
            streak = { user_id: userId, current_streak: 1, last_login_date: today };
        } else {
            const lastLogin = new Date(streak.last_login_date);
            const lastLoginDate = new Date(
                lastLogin.getFullYear(),
                lastLogin.getMonth(),
                lastLogin.getDate()
            );

            if (lastLoginDate.getTime() === today.getTime()) {
                // Already logged in today
                return res.json({
                    success: true,
                    message: 'Already logged in today',
                    streak: { current: streak.current_streak, nextBonus: getNextBonus(streak.current_streak) },
                    tokenBalance: (await dbQuery('SELECT token_balance FROM users WHERE id = $1', [userId])).rows[0].token_balance,
                    reward: { amount: 0, message: 'Already claimed today' },
                });
            }

            if (lastLoginDate.getTime() === yesterday.getTime()) {
                // Streak continues
                streak.current_streak += 1;

                // Check for bonuses
                if (streak.current_streak === 7) {
                    tokensEarned += 100;
                    bonusTriggered = true;
                    bonusMessage = '🎉 7-Day Streak! +100 bonus tokens!';
                } else if (streak.current_streak === 30) {
                    tokensEarned += 500;
                    bonusTriggered = true;
                    bonusMessage = '🏆 30-Day Streak! +500 tokens + Entry Ticket badge!';

                    const cosmeticResult = await dbQuery(
                        `SELECT id FROM cosmetics WHERE name = 'Entry Ticket Badge' LIMIT 1`
                    );
                    if (cosmeticResult.rows.length > 0) {
                        const badgeId = cosmeticResult.rows[0].id;
                        await dbQuery(
                            `INSERT INTO user_cosmetics (user_id, cosmetic_id, acquired_at)
               VALUES ($1, $2, NOW())
               ON CONFLICT (user_id, cosmetic_id) DO NOTHING`,
                            [userId, badgeId]
                        );
                    }
                }
            } else {
                // Streak broken, reset to 1
                streak.current_streak = 1;
            }

            // Update streak in DB
            await dbQuery(
                `UPDATE user_streaks SET current_streak = $1, last_login_date = $2
         WHERE user_id = $3`,
                [streak.current_streak, today, userId]
            );
        }

        // Award tokens
        await dbQuery(
            `UPDATE users SET token_balance = token_balance + $1 WHERE id = $2`,
            [tokensEarned, userId]
        );

        // Log transaction
        await dbQuery(
            `INSERT INTO token_transactions (user_id, amount, type, description, created_at)
       VALUES ($1, $2, 'daily_login', 'Daily Login Reward', NOW())`,
            [userId, tokensEarned]
        );

        const newBalance = (
            await dbQuery(`SELECT token_balance FROM users WHERE id = $1`, [userId])
        ).rows[0].token_balance;

        res.json({
            success: true,
            streak: {
                current: streak.current_streak,
                nextBonus: getNextBonus(streak.current_streak),
            },
            tokenBalance: newBalance,
            reward: {
                amount: tokensEarned,
                message: bonusMessage || '+5 tokens for daily login',
            },
        });
    } catch (error) {
        console.error('Error handling daily login:', error);
        res.status(500).json({ success: false, error: 'Failed to process daily login' });
    }
};

// GET /api/gamification/shop
export const getShop = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        // Fetch all cosmetics
        const cosmeticsResult = await dbQuery(
            `SELECT id, name, type, cost, asset_url, description FROM cosmetics WHERE is_active = true ORDER BY cost ASC`
        );

        // Fetch user's owned cosmetics
        const ownedResult = await dbQuery(
            `SELECT cosmetic_id FROM user_cosmetics WHERE user_id = $1`,
            [userId]
        );

        const ownedIds = new Set(ownedResult.rows.map((r: UserCosmeticRow) => r.cosmetic_id));

        const balanceResult = await dbQuery(
            `SELECT token_balance FROM users WHERE id = $1`,
            [userId]
        );

        const cosmetics = cosmeticsResult.rows.map((c: CosmeticRow) => ({
            id: c.id,
            name: c.name,
            type: c.type,
            cost: c.cost,
            imageUrl: c.asset_url,
            description: c.description,
            owned: ownedIds.has(c.id),
        }));

        res.json({
            success: true,
            cosmetics,
            balance: balanceResult.rows[0]?.token_balance || 0,
        });
    } catch (error) {
        console.error('Error fetching shop:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch shop' });
    }
};

// POST /api/gamification/purchase
export const purchaseCosmetic = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { cosmeticId } = req.body;
        if (!cosmeticId) {
            return res.status(400).json({ success: false, error: 'cosmeticId required' });
        }

        const cosmeticResult = await dbQuery(
            `SELECT id, name, cost FROM cosmetics WHERE id = $1`,
            [cosmeticId]
        );

        if (cosmeticResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Cosmetic not found' });
        }

        const cosmetic = cosmeticResult.rows[0];

        const ownershipResult = await dbQuery(
            `SELECT id FROM user_cosmetics WHERE user_id = $1 AND cosmetic_id = $2`,
            [userId, cosmeticId]
        );

        if (ownershipResult.rows.length > 0) {
            return res.status(400).json({ success: false, error: 'Already owned' });
        }

        const userResult = await dbQuery(
            `SELECT token_balance FROM users WHERE id = $1`,
            [userId]
        );

        const balance = userResult.rows[0].token_balance;
        if (balance < cosmetic.cost) {
            return res.status(400).json({
                success: false,
                error: 'Insufficient tokens',
                deficit: cosmetic.cost - balance,
            });
        }

        await dbQuery(
            `UPDATE users SET token_balance = token_balance - $1 WHERE id = $2`,
            [cosmetic.cost, userId]
        );

        await dbQuery(
            `INSERT INTO user_cosmetics (user_id, cosmetic_id, acquired_at) VALUES ($1, $2, NOW())`,
            [userId, cosmeticId]
        );

        await dbQuery(
            `INSERT INTO token_transactions (user_id, amount, type, description, created_at)
       VALUES ($1, $2, 'purchase', $3, NOW())`,
            [userId, -cosmetic.cost, `Purchased: ${cosmetic.name}`]
        );

        const newBalance = balance - cosmetic.cost;

        res.json({
            success: true,
            item: {
                id: cosmetic.id,
                name: cosmetic.name,
            },
            newBalance,
        });
    } catch (error) {
        console.error('Error purchasing cosmetic:', error);
        res.status(500).json({ success: false, error: 'Failed to purchase cosmetic' });
    }
};

// POST /api/gamification/equip
export const equipCosmetic = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { cosmeticId, slotType } = req.body;
        if (!cosmeticId || !slotType) {
            return res.status(400).json({ success: false, error: 'cosmeticId and slotType required' });
        }

        const validSlots = ['avatar', 'frame', 'background'];
        if (!validSlots.includes(slotType)) {
            return res.status(400).json({ success: false, error: 'Invalid slotType' });
        }

        const ownershipResult = await dbQuery(
            `SELECT id FROM user_cosmetics WHERE user_id = $1 AND cosmetic_id = $2`,
            [userId, cosmeticId]
        );

        if (ownershipResult.rows.length === 0) {
            return res.status(400).json({ success: false, error: 'Cosmetic not owned' });
        }

        await dbQuery(
            `UPDATE user_cosmetics uc
         SET is_equipped = false
         FROM cosmetics c
         WHERE uc.cosmetic_id = c.id AND uc.user_id = $1 AND c.type = $2`,
            [userId, slotType]
        );

        await dbQuery(
            `UPDATE user_cosmetics SET is_equipped = true
       WHERE user_id = $1 AND cosmetic_id = $2`,
            [userId, cosmeticId]
        );

        res.json({
            success: true,
            equipped: {
                cosmeticId,
                slotType,
            },
        });
    } catch (error) {
        console.error('Error equipping cosmetic:', error);
        res.status(500).json({ success: false, error: 'Failed to equip cosmetic' });
    }
};

// POST /api/gamification/share
export const shareRoom = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { roomId } = req.body;

        const shareCheckResult = await dbQuery(
            `SELECT created_at FROM token_transactions 
       WHERE user_id = $1 AND description LIKE 'Room Share%' AND created_at > NOW() - INTERVAL '24 hours'`,
            [userId]
        );

        if (shareCheckResult.rows.length > 0) {
            const nextShareTime = new Date(shareCheckResult.rows[0].created_at);
            nextShareTime.setHours(nextShareTime.getHours() + 24);

            return res.status(429).json({
                success: false,
                error: 'Share limit reached',
                nextShareAvailable: nextShareTime,
            });
        }

        await dbQuery(
            `UPDATE users SET token_balance = token_balance + 50 WHERE id = $1`,
            [userId]
        );

        await dbQuery(
            `INSERT INTO token_transactions (user_id, amount, type, description, created_at)
       VALUES ($1, 50, 'referral', $2, NOW())`,
            [userId, `Room Share - ${roomId || 'General'}`]
        );

        const newBalance = (
            await dbQuery(`SELECT token_balance FROM users WHERE id = $1`, [userId])
        ).rows[0].token_balance;

        res.json({
            success: true,
            tokensAwarded: 50,
            newBalance,
            message: '+50 tokens for sharing!',
        });
    } catch (error) {
        console.error('Error processing share:', error);
        res.status(500).json({ success: false, error: 'Failed to process share' });
    }
};

// Helper: Calculate next bonus milestone
function getNextBonus(currentStreak: number): number {
    if (currentStreak < 7) return 7;
    if (currentStreak < 30) return 30;
    return 30; // Max milestone
}
