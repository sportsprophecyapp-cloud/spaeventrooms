import { Request, Response } from 'express';
import { query as dbQuery } from '../database';
import { AuthRequest } from '../auth/middleware';
import { getLevelFromXp } from '../utils/xpMath';

// GET /api/gamification/me
export const handleGetMe = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

        const userResult = await dbQuery(
            `SELECT token_balance, total_points FROM users WHERE id = $1`,
            [userId]
        );

        if (userResult.rows.length === 0) return res.status(404).json({ success: false, error: 'User not found' });

        const totalXp = userResult.rows[0].total_points || 0;
        const { level, progressXp, nextLevelXp } = getLevelFromXp(totalXp);

        const stats = {
            total_points: totalXp,
            current_level: level,
            token_balance: userResult.rows[0].token_balance || 0,
            progress_xp: progressXp,
            next_level_xp: nextLevelXp
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
            `SELECT id, title, description, claimed_at IS NOT NULL as claimed FROM user_vouchers WHERE user_id = $1 ORDER BY created_at DESC`,
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
        const result = await dbQuery(`SELECT * FROM prize_draws WHERE status = 'active' ORDER BY created_at DESC`);
        res.json({ success: true, draws: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error fetching draws' });
    }
};

export const handleDailyLogin = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const result = await dbQuery(`UPDATE users SET token_balance = token_balance + 5 WHERE id = $1 RETURNING token_balance`, [userId]);
        const newBalance = result.rows[0]?.token_balance || 0;
        res.json({ success: true, streak: { current: 1, nextBonus: 7 }, tokenBalance: newBalance, reward: { amount: 5, message: 'Tokens received! (+5)' } });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

export const getShop = async (req: AuthRequest, res: Response) => {
    try {
        const result = await dbQuery(`SELECT * FROM cosmetics WHERE is_active = true`);
        res.json({ success: true, cosmetics: result.rows });
    } catch (e) { res.json({ success: true, cosmetics: [] }); }
};

export const handleDeleteDraw = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        await dbQuery(`DELETE FROM prize_draws WHERE id = $1`, [id]);
        res.json({ success: true, message: 'Draw removed successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Delete failed' });
    }
};

export const handleGetUserTickets = handleGetTickets; // Alias for route consistency

export const purchaseCosmetic = async (req: AuthRequest, res: Response) => res.json({ success: false });
export const equipCosmetic = async (req: AuthRequest, res: Response) => res.json({ success: false });
export const shareRoom = async (req: AuthRequest, res: Response) => res.json({ success: false });
