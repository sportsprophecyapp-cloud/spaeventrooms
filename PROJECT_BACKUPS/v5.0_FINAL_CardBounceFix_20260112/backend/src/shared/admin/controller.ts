import { Request, Response } from 'express';
import { query } from '../database';
import { socketService } from '../socket/SocketService';

// 1. GET ALL SUPPORTERS
export const getAllSupporters = async (req: Request, res: Response) => {
    try {
        const sql = `
            SELECT 
                u.id, 
                u.username, 
                u.email, 
                u.created_at,
                u.token_balance, 
                u.total_tickets,
                u.current_level,
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

// 3. GET ONLINE USERS
export const getOnlineUsers = (req: Request, res: Response) => {
    try {
        const onlineUserIds = socketService.getOnlineUserIds();
        res.json({ onlineUsers: onlineUserIds });
    } catch (err) {
        console.error("[ERROR] Failed to get online users:", err);
        res.status(500).json({ error: 'Could not retrieve online user data.' });
    }
};

// 4. SEND GLOBAL ANNOUNCEMENT
export const sendGlobalAnnouncement = async (req: Request, res: Response) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ message: 'Announcement message is required.' });
    }
    try {
        const payload = { message, timestamp: new Date().toISOString() };
        socketService.getIO()?.emit('global_announcement', payload);
        console.log(`Sent global announcement: "${message}"`);
        res.json({ success: true, message: 'Announcement broadcast to all online users.' });
    } catch (err) {
        console.error(`[FATAL] Global announcement failed:`, err);
        res.status(500).json({ error: 'The announcement could not be sent.' });
    }
};

// 5. SEND MESSAGE TO USER
export const sendMessageToUser = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { message } = req.body;
    if (!userId || !message) {
        return res.status(400).json({ message: 'User ID and message are required.' });
    }
    try {
        const userRoom = `user:${userId}`;
        const payload = { from: 'Admin', message, timestamp: new Date().toISOString() };
        socketService.emitToRoom(userRoom, 'private_message', payload);
        console.log(`Admin message sent to user ${userId}: "${message}"`);
        res.json({ success: true, message: `Message successfully sent to user ${userId}.` });
    } catch (err) {
        console.error(`[ERROR] Failed to send private message to user ${userId}:`, err);
        res.status(500).json({ error: 'The message could not be sent due to a server error.' });
    }
};

// 6. BAN USER
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

// 7. MUTE USER
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

// 8. UPDATE PERMISSIONS
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

// STUBS FOR BUILD
export const searchSupporters = async (req: Request, res: Response) => {
    res.status(501).json({ message: 'Not Implemented' });
};
export const getRooms = async (req: Request, res: Response) => {
    res.status(501).json({ message: 'Not Implemented' });
};
export const getSponsorStats = async (req: Request, res: Response) => {
    try {
        const activeSponsorsRes = await query("SELECT COUNT(*) FROM sponsor_applications WHERE status = 'approved'");
        const activeSponsorshipsRes = await query("SELECT COUNT(*) FROM room_sponsors WHERE is_active = TRUE");
        const predictionsRes = await query("SELECT COUNT(*) FROM soccer_predictions");

        const stats = {
            totalActiveSponsors: parseInt(activeSponsorsRes.rows[0].count, 10) || 0,
            totalActiveSponsorships: parseInt(activeSponsorshipsRes.rows[0].count, 10) || 0,
            overallPredictionCount: parseInt(predictionsRes.rows[0].count, 10) || 0
        };

        res.json(stats);
    } catch (err) {
        console.error('Failed to get sponsor stats:', err);
        res.status(500).json({ error: 'Failed to fetch sponsor stats' });
    }
};
export const getSponsorReport = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // sponsor_id

        // Impressions & Clicks
        const analyticsRes = await query(
            `SELECT event_type, COUNT(*) as count 
             FROM sponsor_analytics 
             WHERE sponsor_id = $1 
             GROUP BY event_type`,
            [id]
        );

        // Predictions in their room
        const predictionsRes = await query(
            `SELECT COUNT(*) FROM soccer_predictions sp
             JOIN room_sponsors rs ON rs.room_id = 'soccer' -- Logic: if they sponsor soccer room
             WHERE rs.id = $1`,
            [id]
        );

        // Prize Draw Entries
        const entriesRes = await query(
            `SELECT COUNT(*) FROM prize_draw_entries pde
             JOIN prize_draws pd ON pde.draw_id = pd.id
             WHERE pd.sponsor_id = $1`,
            [id]
        );

        const report = {
            impressions: parseInt(analyticsRes.rows.find(r => r.event_type === 'impression')?.count || '0', 10),
            clicks: parseInt(analyticsRes.rows.find(r => r.event_type === 'click')?.count || '0', 10),
            totalPredictions: parseInt(predictionsRes.rows[0].count, 10) || 0,
            drawEntries: parseInt(entriesRes.rows[0].count, 10) || 0
        };

        res.json(report);
    } catch (err) {
        console.error('Failed to generate sponsor report:', err);
        res.status(500).json({ error: 'Failed to fetch report data' });
    }
};
