import { Request, Response } from 'express';
import { query } from '../database';
import { socketService } from '../socket/SocketService';

// ... (getAllSupporters, getSiteStats, etc. remain the same)

export const getOnlineUsers = (req: Request, res: Response) => {
    try {
        const onlineUserIds = socketService.getOnlineUserIds();
        res.json({ onlineUsers: onlineUserIds });
    } catch (err) {
        console.error("[ERROR] Failed to get online users:", err);
        res.status(500).json({ error: 'Could not retrieve online user data.' });
    }
};


// 1. GET ALL SUPPORTERS (STEP 1: RESTORE PREDICTION COUNT)
export const getAllSupporters = async (req: Request, res: Response) => {
    try {
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
    // ... (existing implementation)
};

// 3. GET SPONSOR STATS (NEW)
export const getSponsorStats = async (req: Request, res: Response) => {
    // ... (existing implementation)
};

// 4. SEND MESSAGE TO USER (UPGRADED)
export const sendMessageToUser = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { message } = req.body;

    if (!userId || !message) {
        return res.status(400).json({ message: 'User ID and message are required.' });
    }

    try {
        // The user-specific room is just `user:${userId}`
        const userRoom = `user:${userId}`;
        const payload = { 
            from: 'Admin', 
            message, 
            timestamp: new Date().toISOString() 
        };

        // Emit the event directly to that user's room.
        socketService.emitToRoom(userRoom, 'private_message', payload);

        console.log(`Admin message sent to user ${userId}: "${message}"`);
        res.json({ success: true, message: `Message successfully sent to user ${userId}.` });

    } catch (err) {
        console.error(`[ERROR] Failed to send private message to user ${userId}:`, err);
        res.status(500).json({ error: 'The message could not be sent due to a server error.' });
    }
};


// 5. BAN USER
export const banUser = async (req: Request, res: Response) => {
    // ... (existing implementation)
};

// 6. MUTE USER
export const muteUser = async (req: Request, res: Response) => {
    // ... (existing implementation)
};

// 7. UPDATE PERMISSIONS
export const updateUserPermissions = async (req: Request, res: Response) => {
    // ... (existing implementation)
};

// RESTORING STUBS FOR BUILD
export const searchSupporters = async (req: Request, res: Response) => {
    res.status(501).json({ message: 'Not Implemented' });
};

export const getRooms = async (req: Request, res: Response) => {
    res.status(501).json({ message: 'Not Implemented' });
};
