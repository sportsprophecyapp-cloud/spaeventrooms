import { Request, Response } from 'express';
import { query } from '../database';

// 1. GET ALL SUPPORTERS (STEP 1: RESTORE PREDICTION COUNT)
export const getAllSupporters = async (req: Request, res: Response) => {
    try {
        // Using a subquery for the count is safer and avoids the complex JOIN that was crashing the server.
        const sql = `
            SELECT 
                u.id, 
                u.username, 
                u.email, 
                u.created_at,
                '[]'::jsonb as permissions, -- Placeholder
                false as is_banned,        -- Placeholder
                false as is_muted,         -- Placeholder
                (SELECT COUNT(*) FROM soccer_predictions WHERE user_id = u.id) as prediction_count
            FROM users u
            ORDER BY u.created_at DESC
        `;
        const result = await query(sql);
        res.json(result.rows);
    } catch (err) { 
        console.error("[FATAL] CRASH while restoring prediction_count:", err);
        res.status(500).json({ error: 'A critical and persistent error occurred on the server.' }); 
    }
};


// 2. GET SITE STATS
export const getSiteStats = async (req: Request, res: Response) => {
    try {
        const userCountResult = await query('SELECT COUNT(*) FROM users');
        const predictionCountResult = await query('SELECT COUNT(*) FROM soccer_predictions');
        const stats = {
            totalUsers: parseInt(userCountResult.rows[0].count, 10),
            totalPredictions: parseInt(predictionCountResult.rows[0].count, 10)
        };
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch site stats' });
    }
};

// 3. GET SPONSOR STATS (NEW)
export const getSponsorStats = async (req: Request, res: Response) => {
    try {
        const totalSponsorsResult = await query('SELECT COUNT(DISTINCT sponsor_id) FROM sponsor_subscriptions WHERE is_active = TRUE');
        const totalSubscriptionsResult = await query('SELECT COUNT(*) FROM sponsor_subscriptions WHERE is_active = TRUE');
        const totalPredictionsResult = await query('SELECT COUNT(*) FROM soccer_predictions');

        const stats = {
            totalActiveSponsors: parseInt(totalSponsorsResult.rows[0].count, 10),
            totalActiveSponsorships: parseInt(totalSubscriptionsResult.rows[0].count, 10),
            overallPredictionCount: parseInt(totalPredictionsResult.rows[0].count, 10)
        };
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch sponsor stats' });
    }
};

// 4. SEND MESSAGE TO USER
export const sendMessageToUser = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { message } = req.body;
    console.log(`Message for user ${userId}: "${message}"`);
    res.json({ success: true, message: 'Message sent (logged to console)' });
};

// 5. BAN USER
export const banUser = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { is_banned } = req.body;
    try {
        await query('UPDATE users SET is_banned = $1 WHERE id = $2', [is_banned, userId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Update failed' });
    }
};

// 6. MUTE USER
export const muteUser = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { is_muted } = req.body;
    try {
        await query('UPDATE users SET is_muted = $1 WHERE id = $2', [is_muted, userId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Update failed' });
    }
};

// 7. UPDATE PERMISSIONS
export const updateUserPermissions = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { permissions } = req.body;
    try {
        await query('UPDATE users SET permissions = $1 WHERE id = $2', [JSON.stringify(permissions), userId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Update failed' });
    }
};

// RESTORING STUBS FOR BUILD
export const searchSupporters = async (req: Request, res: Response) => {
    res.status(501).json({ message: 'Not Implemented' });
};

export const getRooms = async (req: Request, res: Response) => {
    res.status(501).json({ message: 'Not Implemented' });
};
