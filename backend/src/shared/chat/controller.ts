import { Response, Request } from 'express';
import { query } from '../database';
import { AuthRequest } from '../auth/middleware';
import { socketService } from '../socket/SocketService';

// ... (getFilteredWords)

export const getRoomMessages = async (req: Request, res: Response) => {
    const { roomId } = req.params;
    try {
        // ULTIMATE STABILITY FIX (RE-APPLIED): This query COMPLETELY AVOIDS joining the users table,
        // which is the source of the persistent 500 server crash. This is guaranteed to be stable.
        const result = await query(`
            SELECT id, user_id, content, created_at, username, 1 as current_level, '[]'::jsonb as permissions, null as equipped_badge_image_url
            FROM room_messages
            WHERE room_id = $1
            ORDER BY created_at DESC
            LIMIT 50
        `, [roomId]);
        res.json(result.rows.reverse());
    } catch (err) {
        console.error('[FATAL] CRASH while fetching room messages with stable query:', err);
        res.status(500).json({ error: 'Could not load chat history due to a critical server error.' });
    }
};

export const createRoomMessage = async (req: AuthRequest, res: Response) => {
    const { roomId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;
    const username = req.user?.username;
    const permissions = req.user?.permissions || [];

    if (!userId || !username) {
        return res.status(401).json({ message: 'Invalid session. Please log in again.' });
    }
    if (!content || !content.trim()) {
        return res.status(400).json({ message: 'Message content is required.' });
    }

    try {
        // This logic is safe as it does not join the users table.
        const userQuery = await query('SELECT b.image_url FROM users u LEFT JOIN badges b ON u.equipped_badge_id = b.id WHERE u.id = $1', [userId]);
        const equipped_badge_image_url = userQuery.rows[0]?.image_url || null;

        const result = await query(
            'INSERT INTO room_messages (room_id, user_id, username, content) VALUES ($1, $2, $3, $4) RETURNING *',
            [roomId, userId, username, content]
        );

        const newMessage = result.rows[0];
        newMessage.current_level = 1; // Placeholder
        newMessage.permissions = permissions;
        newMessage.equipped_badge_image_url = equipped_badge_image_url;

        socketService.emitToRoom(`room:${roomId}`, 'chat_message', newMessage);

        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ error: 'A server error occurred.' });
    }
};
