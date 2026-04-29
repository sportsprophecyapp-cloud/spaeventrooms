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

export const handleGetMyEntries = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const result = await dbQuery(`
            SELECT draw_id, COUNT(*) as count 
            FROM prize_draw_entries 
            WHERE user_id = $1 
            GROUP BY draw_id
        `, [userId]);
        res.json({ success: true, entries: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error fetching your entries' });
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
            reward: {
                amount: result.reward.tokens,
                message: result.reward.message || `+${result.reward.tokens} Tokens, +${result.reward.tickets} Tickets! Streak: ${result.streak} days`
            }
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

export const handleEnterDraw = async (req: AuthRequest, res: Response) => {
    const { id: drawId } = req.params;
    const userId = req.user?.id;

    try {
        await dbQuery('BEGIN');

        // 1. Check if user has at least 1 ticket
        const userRes = await dbQuery('SELECT total_tickets FROM users WHERE id = $1 FOR UPDATE', [userId]);
        const tickets = userRes.rows[0]?.total_tickets || 0;

        if (tickets <= 0) {
            await dbQuery('ROLLBACK');
            return res.status(400).json({ success: false, error: 'Insufficient tickets' });
        }

        // 2. Deduct 1 ticket
        await dbQuery('UPDATE users SET total_tickets = total_tickets - 1 WHERE id = $1', [userId]);

        // 3. Insert the entry (Allowing multiple entries)
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
        await dbQuery('BEGIN');
        // Explicitly delete related records if they exist
        await dbQuery(`DELETE FROM user_vouchers WHERE draw_id = $1`, [id]);
        await dbQuery(`DELETE FROM prize_draw_entries WHERE draw_id = $1`, [id]);
        await dbQuery(`DELETE FROM prize_draws WHERE id = $1`, [id]);
        await dbQuery('COMMIT');
        res.json({ success: true, message: 'Draw removed successfully' });
    } catch (err) {
        await dbQuery('ROLLBACK');
        console.error('Delete draw failed:', err);
        res.status(500).json({ error: 'Delete failed' });
    }
};

export const handleGetUserTickets = handleGetTickets;

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

export const handleGetAchievements = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

        // Fetch all achievement cosmetics
        const achievementsResult = await dbQuery(
            `SELECT id, name, type, asset_url, description, requirement 
             FROM cosmetics 
             WHERE is_achievement_reward = true AND is_active = true 
             ORDER BY created_at ASC`
        );

        // Fetch user stats
        const userStatsResult = await dbQuery(
            `SELECT 
                (SELECT COUNT(*)::int FROM soccer_predictions WHERE user_id = u.id AND result = 'correct') as correct_picks, 
                (SELECT COUNT(*)::int FROM users WHERE referred_by_id = u.id) as referral_count, 
                u.consecutive_login_days as streak,
                (SELECT COUNT(*)::int FROM prize_draws WHERE winner_id = u.id AND status = 'completed') as wins
             FROM users u
             WHERE u.id = $1`,
            [userId]
        );

        const userStats = userStatsResult.rows[0] || {
            correct_picks: 0,
            referral_count: 0,
            streak: 0,
            wins: 0
        };

        // Fetch user's unlocked achievements
        const unlockedResult = await dbQuery(
            `SELECT cosmetic_id FROM user_cosmetics WHERE user_id = $1`,
            [userId]
        );
        const unlockedIds = new Set(unlockedResult.rows.map(r => r.cosmetic_id));

        // Parse achievement requirements and calculate progress
        const achievements = achievementsResult.rows.map(achievement => {
            // Parse the requirement to determine target type and value
            const req = achievement.requirement.toLowerCase();
            let targetType = 'unknown';
            let target = 0;

            if (req.includes('correct prediction')) {
                targetType = 'correct_picks';
                const match = req.match(/(\d+)/);
                target = match ? parseInt(match[1]) : 0;
            } else if (req.includes('refer') || req.includes('friend')) {
                targetType = 'referrals';
                const match = req.match(/(\d+)/);
                target = match ? parseInt(match[1]) : 0;
            } else if (req.includes('streak') || req.includes('login')) {
                targetType = 'streak';
                const match = req.match(/(\d+)/);
                target = match ? parseInt(match[1]) : 0;
            } else if (req.includes('win') && req.includes('draw')) {
                targetType = 'wins';
                target = 1;
            }

            // Get current progress
            const current = userStats[targetType] || 0;
            const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;
            const unlocked = unlockedIds.has(achievement.id) || progress >= 100;

            return {
                id: achievement.id,
                name: achievement.name,
                type: achievement.type,
                asset: achievement.asset_url,
                description: achievement.description,
                requirement: achievement.requirement,
                targetType,
                target,
                current,
                progress,
                unlocked
            };
        });

        res.json({ success: true, achievements, userStats });
    } catch (error) {
        console.error('Error fetching achievements:', error);
        res.status(500).json({ success: false, error: 'Error fetching achievements' });
    }
};

export const handleGetHistory = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { page = '1', limit = '20', filter = 'all' } = req.query;

    try {
        const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
        const limitVal = parseInt(limit as string);

        let queryStr = `
            SELECT 
                p.id, p.prediction_data->>'pick' as pick, p.created_at, p.result as status,
                m.home_team, m.away_team, m.home_logo, m.away_logo, m.score_home, m.score_away, m.start_time
            FROM soccer_predictions p
            JOIN soccer_matches m ON p.match_id = m.match_id
            WHERE p.user_id = $1
        `;

        const params: any[] = [userId];
        let paramIdx = 2;

        if (filter === 'wins') {
            queryStr += ` AND p.result = 'correct'`;
        } else if (filter === 'pending') {
            queryStr += ` AND p.result = 'pending'`;
        } else if (filter === 'incorrect') {
            queryStr += ` AND p.result = 'incorrect'`;
        }

        queryStr += ` ORDER BY p.created_at DESC LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`;
        params.push(limitVal, offset);

        const result = await dbQuery(queryStr, params);

        // Get total count for pagination
        let countQuery = `SELECT COUNT(*) FROM soccer_predictions WHERE user_id = $1`;
        if (filter === 'wins') countQuery += ` AND result = 'correct'`;
        else if (filter === 'pending') countQuery += ` AND result = 'pending'`;
        else if (filter === 'incorrect') countQuery += ` AND result = 'incorrect'`;

        const countRes = await dbQuery(countQuery, [userId]);

        res.json({
            success: true,
            history: result.rows,
            total: parseInt(countRes.rows[0].count),
            page: parseInt(page as string),
            totalPages: Math.ceil(parseInt(countRes.rows[0].count) / limitVal)
        });
    } catch (err) {
        console.error('Error fetching history:', err);
        res.status(500).json({ success: false, error: 'Error fetching history' });
    }
};
