import { Request, Response } from 'express';
import { query as dbQuery, getClient as dbGetClient } from '../database';
import { AuthRequest } from '../auth/middleware';
import { getLevelFromXp } from '../utils/xpMath';
import { pickWinner } from '../services/drawService';

// GET /api/gamification/me
export const handleGetMe = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

        const userResult = await dbQuery(
            `SELECT token_balance, total_tickets, total_points FROM users WHERE id = $1`,
            [userId]
        );

        if (userResult.rows.length === 0) return res.status(404).json({ success: false, error: 'User not found' });

        const totalXp = userResult.rows[0].total_points || 0;
        const totalTickets = userResult.rows[0].total_tickets || 0;
        const { level, progressXp, nextLevelXp } = getLevelFromXp(totalXp);

        // Fetch equipped cosmetics
        const equippedResult = await dbQuery(
            `SELECT c.type, c.asset_url FROM cosmetics c 
             JOIN user_cosmetics uc ON c.id = uc.cosmetic_id 
             WHERE uc.user_id = $1 AND uc.is_equipped = true`,
            [userId]
        );

        const equipped: { [key: string]: string } = {};
        equippedResult.rows.forEach(row => {
            equipped[row.type] = row.asset_url;
        });

        const stats = {
            total_points: totalXp,
            current_level: level,
            token_balance: userResult.rows[0].token_balance || 0,
            total_tickets: totalTickets,
            progress_xp: progressXp,
            next_level_xp: nextLevelXp,
            equipped
        };

        let badges: any[] = [];
        try {
            const badgesResult = await dbQuery(
                `SELECT c.id, c.name, c.icon, c.description, uc.acquired_at 
                 FROM cosmetics c JOIN user_cosmetics uc ON c.id = uc.cosmetic_id 
                 WHERE uc.user_id = $1 AND c.type = 'badge'`, [userId]
            );
            badges = badgesResult.rows;
        } catch (e) { }

        res.json({ success: true, stats, badges });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// ... Rest of controller (handleGetLeaderboard, handleDailyLogin, etc.)
// Updated to use the same logic for leaderboard levels

export const handleGetLeaderboard = async (req: Request, res: Response) => {
    try {
        const result = await dbQuery(
            `SELECT username, total_points as points FROM users 
             WHERE total_points IS NOT NULL ORDER BY total_points DESC LIMIT 100`
        );

        const leaderboard = result.rows.map((r, i) => {
            const { level } = getLevelFromXp(r.points || 0);
            return {
                rank: i + 1,
                username: r.username || 'Unknown Pro',
                points: r.points || 0,
                level: level
            };
        });

        res.json({ success: true, leaderboard });
    } catch (error) {
        res.json({ success: true, leaderboard: [] });
    }
};

export const handleGetVouchers = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const result = await dbQuery(
            `SELECT id, draw_id, title, description, claimed_at IS NOT NULL as claimed FROM user_vouchers WHERE user_id = $1 ORDER BY created_at DESC`,
            [userId]
        );
        res.json({ success: true, vouchers: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error fetching vouchers' });
    }
};

export const handleClaimVoucher = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { voucherId } = req.body;

        const result = await dbQuery(
            `UPDATE user_vouchers SET claimed_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 AND claimed_at IS NULL RETURNING id`,
            [voucherId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Voucher not found or already claimed' });
        }

        res.json({ success: true, voucherId });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error claiming voucher' });
    }
};

export const handleGetTickets = async (req: AuthRequest, res: Response) => {
    try {
        const result = await dbQuery(`SELECT total_tickets as count FROM users WHERE id = $1`, [req.user?.id]);
        res.json({ success: true, count: result.rows[0]?.count || 0 });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error fetching tickets' });
    }
};

export const handleGetActiveDraws = async (req: Request, res: Response) => {
    try {
        const result = await dbQuery(`
            SELECT 
                d.*,
                COUNT(e.id) as entry_count,
                rs.sponsor_name as sponsor_name,
                rs.logo_url as sponsor_logo
            FROM prize_draws d
            LEFT JOIN prize_draw_entries e ON d.id = e.draw_id
            LEFT JOIN room_sponsors rs ON d.sponsor_id = rs.id
            WHERE d.status = 'active'
            GROUP BY d.id, rs.sponsor_name, rs.logo_url
            ORDER BY d.created_at DESC
        `);
        res.json({ success: true, draws: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error fetching draws' });
    }
};

export const handleDailyLogin = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

        const { gamificationService } = require('./GamificationService');
        const result = await gamificationService.handleDailyLogin(userId);

        if (result.alreadyClaimed) {
            return res.json({
                success: true,
                alreadyClaimed: true,
                streak: result.streak,
                message: 'Daily reward already claimed today!'
            });
        }

        res.json({
            success: true,
            streak: { current: result.streak, nextBonus: 7 },
            tokenBalance: result.newBalances.newBalance,
            reward: { amount: result.reward.tokens, message: result.reward.message || `Tokens received! Streak: ${result.streak} days` }
        });
    } catch (error) {
        console.error('Error in handleDailyLogin:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

export const getShop = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        // Include all active items so shop can show achievement previews
        const result = await dbQuery(`SELECT * FROM cosmetics WHERE is_active = true`);
        const userRes = await dbQuery('SELECT token_balance, total_tickets FROM users WHERE id = $1', [userId]);
        const user = userRes.rows[0] || { token_balance: 0, total_tickets: 0 };

        res.json({
            success: true,
            cosmetics: result.rows,
            balance: user.token_balance,
            tickets: user.total_tickets
        });
    } catch (e) { res.json({ success: true, cosmetics: [], balance: 0, tickets: 0 }); }
};

// ... existing code ...

export const purchaseCosmetic = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { cosmeticId } = req.body;

    try {
        const cosResult = await dbQuery('SELECT * FROM cosmetics WHERE id = $1 AND is_active = true', [cosmeticId]);
        if (cosResult.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
        const item = cosResult.rows[0];

        // NEW: PREVENT PURCHASE OF ACHIEVEMENT REWARDS
        if (item.is_achievement_reward) {
            return res.status(403).json({ error: 'This item must be earned through achievements and cannot be purchased.' });
        }

        const client = await dbGetClient();
        try {
            await client.query('BEGIN');

            const ownResult = await client.query('SELECT 1 FROM user_cosmetics WHERE user_id = $1 AND cosmetic_id = $2 FOR UPDATE', [userId, cosmeticId]);
            if (ownResult.rows.length > 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ error: 'Already owned' });
            }

            const userResult = await client.query('SELECT token_balance FROM users WHERE id = $1 FOR UPDATE', [userId]);
            const balance = userResult.rows[0].token_balance;

            if (balance < item.cost) {
                await client.query('ROLLBACK');
                return res.status(400).json({ error: 'Insufficient tokens' });
            }

            await client.query('UPDATE users SET token_balance = token_balance - $1 WHERE id = $2', [item.cost, userId]);
            await client.query('INSERT INTO user_cosmetics (user_id, cosmetic_id) VALUES ($1, $2)', [userId, cosmeticId]);

            await client.query(`
                INSERT INTO token_transactions (user_id, amount, type, description)
                VALUES ($1, $2, 'shop_purchase', $3)
            `, [userId, -item.cost, `Purchased ${item.name}`]);

            await client.query('COMMIT');
            res.json({ success: true, newBalance: balance - item.cost });
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Purchase error:', err);
        res.status(500).json({ error: 'Purchase failed' });
    }
};

export const equipCosmetic = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { cosmeticId } = req.body;

    try {
        // 1. Verify ownership and type
        const itemResult = await dbQuery(`
            SELECT c.id, c.type, c.is_achievement_reward
            FROM cosmetics c 
            JOIN user_cosmetics uc ON c.id = uc.cosmetic_id 
            WHERE uc.user_id = $1 AND c.id = $2`, [userId, cosmeticId]);

        if (itemResult.rows.length === 0) return res.status(403).json({ error: 'You do not own this item' });
        const item = itemResult.rows[0];

        await dbQuery('BEGIN');
        // 2. Unequip same types
        await dbQuery(`
            UPDATE user_cosmetics uc 
            SET is_equipped = false 
            FROM cosmetics c 
            WHERE uc.cosmetic_id = c.id AND uc.user_id = $1 AND c.type = $2`, [userId, item.type]);

        // 3. Equip new one
        await dbQuery('UPDATE user_cosmetics SET is_equipped = true WHERE user_id = $1 AND cosmetic_id = $2', [userId, cosmeticId]);

        // 4. Update users table for fast access if avatar
        if (item.type === 'avatar') {
            const cos = await dbQuery('SELECT asset_url FROM cosmetics WHERE id = $1', [cosmeticId]);
            await dbQuery('UPDATE users SET avatar_url = $1 WHERE id = $2', [cos.rows[0].asset_url, userId]);
        }

        await dbQuery('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await dbQuery('ROLLBACK');
        res.status(500).json({ error: 'Equip failed' });
    }
};
export const shareRoom = async (req: AuthRequest, res: Response) => res.json({ success: false });

export const handleGetRecentWinners = async (req: Request, res: Response) => {
    try {
        const result = await dbQuery(`
            SELECT 
                u.username,
                d.title as draw_title,
                d.prize,
                d.draw_date,
                rs.sponsor_name as sponsor_name
            FROM prize_draws d
            JOIN users u ON d.winner_id = u.id
            LEFT JOIN room_sponsors rs ON d.sponsor_id = rs.id
            WHERE d.status = 'completed' AND d.winner_id IS NOT NULL
            ORDER BY d.draw_date DESC
            LIMIT 5
        `);
        res.json({ success: true, winners: result.rows });
    } catch (error) {
        console.error('Error fetching recent winners:', error);
        res.status(500).json({ success: false, error: 'Error fetching winners' });
    }
};

export const handleGetAllBadges = async (req: Request, res: Response) => {
    try {
        const result = await dbQuery(
            `SELECT id, name, description, requirement, asset_url 
             FROM cosmetics 
             WHERE type = 'badge' AND is_active = true 
             ORDER BY created_at ASC`
        );
        res.json({ success: true, badges: result.rows });
    } catch (error) {
        console.error('Error fetching all badges:', error);
        res.status(500).json({ success: false, error: 'Error fetching badges' });
    }
};
