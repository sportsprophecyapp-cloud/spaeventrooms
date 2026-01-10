import { Request, Response } from 'express';
import { query as dbQuery } from '../database';
import { AuthRequest } from '../auth/middleware';
import { getLevelFromXp } from '../utils/xpMath';
import { pickWinner } from '../services/drawService';

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
                rs.name as sponsor_name,
                rs.logo_url as sponsor_logo
            FROM prize_draws d
            LEFT JOIN prize_draw_entries e ON d.id = e.draw_id
            LEFT JOIN room_sponsors rs ON d.sponsor_id = rs.id
            WHERE d.status = 'active'
            GROUP BY d.id, rs.name, rs.logo_url
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

        // 1. Get current streak info
        const userResult = await dbQuery(
            'SELECT consecutive_login_days, last_login_at, token_balance FROM users WHERE id = $1',
            [userId]
        );
        const user = userResult.rows[0];

        const now = new Date();
        const lastLogin = user.last_login_at ? new Date(user.last_login_at) : null;

        let newStreak = user.consecutive_login_days || 0;
        let alreadyClaimed = false;

        if (lastLogin) {
            const diffTime = now.getTime() - lastLogin.getTime();
            const diffDays = diffTime / (1000 * 60 * 60 * 24);

            if (diffDays < 1 && now.getDate() === lastLogin.getDate()) {
                alreadyClaimed = true;
            } else if (diffDays < 2) {
                newStreak += 1;
            } else {
                newStreak = 1; // Reset streak
            }
        } else {
            newStreak = 1; // First login
        }

        if (alreadyClaimed) {
            return res.json({
                success: true,
                alreadyClaimed: true,
                streak: newStreak,
                message: 'Daily reward already claimed today!'
            });
        }

        // 2. Update user streak and last login
        const updateResult = await dbQuery(
            'UPDATE users SET consecutive_login_days = $1, last_login_at = $2, token_balance = token_balance + 5 WHERE id = $3 RETURNING token_balance',
            [newStreak, now, userId]
        );

        // 3. Check for streak milestones
        const { BadgeService } = require('./BadgeService');
        await BadgeService.checkStreakMilestones(userId, newStreak);

        const newBalance = updateResult.rows[0]?.token_balance || 0;
        res.json({
            success: true,
            streak: { current: newStreak, nextBonus: 7 },
            tokenBalance: newBalance,
            reward: { amount: 5, message: `Tokens received! Streak: ${newStreak} days` }
        });
    } catch (error) {
        console.error('Error in handleDailyLogin:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

export const getShop = async (req: AuthRequest, res: Response) => {
    try {
        const result = await dbQuery(`SELECT * FROM cosmetics WHERE is_active = true`);
        res.json({ success: true, cosmetics: result.rows });
    } catch (e) { res.json({ success: true, cosmetics: [] }); }
};

export const handleEnterDraw = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { id: drawId } = req.params;

        if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

        // 1. Check user tickets
        const userResult = await dbQuery(`SELECT total_tickets FROM users WHERE id = $1`, [userId]);
        const tickets = userResult.rows[0]?.total_tickets || 0;

        if (tickets <= 0) {
            return res.status(400).json({ success: false, error: 'You do not have enough tickets to enter.' });
        }

        // 2. Check if draw exists and is active
        const drawResult = await dbQuery(`SELECT id FROM prize_draws WHERE id = $1 AND status = 'active'`, [drawId]);
        if (drawResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Target draw is no longer active or does not exist.' });
        }

        // 3. Deduct ticket and record entry
        await dbQuery('BEGIN');
        await dbQuery(`UPDATE users SET total_tickets = total_tickets - 1 WHERE id = $1`, [userId]);
        await dbQuery(
            `INSERT INTO prize_draw_entries (draw_id, user_id, entry_type) VALUES ($1, $2, 'manual')`,
            [drawId, userId]
        );
        await dbQuery('COMMIT');

        res.json({ success: true, message: 'Successfully entered draw!' });
    } catch (error) {
        await dbQuery('ROLLBACK');
        console.error('Error in handleEnterDraw:', error);
        res.status(500).json({ success: false, error: 'Failed to enter draw.' });
    }
};

export const handlePickWinner = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        const winner = await pickWinner(parseInt(id));
        if (!winner) return res.status(404).json({ success: false, error: 'No entries found or draw already completed' });
        res.json({ success: true, winner });
    } catch (err) {
        res.status(500).json({ error: 'Pick winner failed' });
    }
};

export const handleGetWins = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const result = await dbQuery(
            `SELECT d.id, d.title, d.prize, d.draw_date 
             FROM prize_draws d
             WHERE d.winner_id = $1 AND d.status = 'completed'
             ORDER BY d.draw_date DESC`,
            [userId]
        );
        res.json({ success: true, wins: result.rows });
    } catch (error) {
        console.error('Error in handleGetWins:', error);
        res.status(500).json({ success: false, error: 'Error fetching wins' });
    }
};

export const handleUpdateDraw = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { draw_date, status } = req.body;

    try {
        let updateQuery = 'UPDATE prize_draws SET ';
        const params: any[] = [];
        let paramIndex = 1;

        if (draw_date !== undefined) {
            updateQuery += `draw_date = $${paramIndex}, `;
            params.push(draw_date);
            paramIndex++;
        }

        if (status !== undefined) {
            updateQuery += `status = $${paramIndex}, `;
            params.push(status);
            paramIndex++;
        }

        // Remove trailing comma and space
        updateQuery = updateQuery.slice(0, -2);
        updateQuery += ` WHERE id = $${paramIndex} RETURNING *`;
        params.push(id);

        const result = await dbQuery(updateQuery, params);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Draw not found' });
        }

        res.json({ success: true, draw: result.rows[0] });
    } catch (error) {
        console.error('Error updating draw:', error);
        res.status(500).json({ success: false, error: 'Failed to update draw' });
    }
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

export const handleGetRecentWinners = async (req: Request, res: Response) => {
    try {
        const result = await dbQuery(`
            SELECT 
                u.username,
                d.title as draw_title,
                d.prize,
                d.draw_date,
                rs.name as sponsor_name
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
