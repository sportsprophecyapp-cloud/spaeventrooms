import { Request, Response } from 'express';
import { query } from '../database';
import { socketService } from '../socket/SocketService';

// ... (other controller functions)

export const sendGlobalAnnouncement = async (req: Request, res: Response) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ message: 'Announcement message is required.' });
    }

    try {
        const payload = { 
            message,
            timestamp: new Date().toISOString() 
        };

        // Emit to all connected clients in the global namespace
        socketService.getIO()?.emit('global_announcement', payload);

        console.log(`Sent global announcement: "${message}"`);
        res.json({ success: true, message: 'Announcement broadcast to all online users.' });

    } catch (err) {
        console.error(`[FATAL] Global announcement failed:`, err);
        res.status(500).json({ error: 'The announcement could not be sent.' });
    }
};

// ... (rest of the controller file)
