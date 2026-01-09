import { Response, Request } from 'express';
import { query } from '../database';
import { AuthRequest } from '../auth/middleware';
import { socketService } from '../socket/SocketService';

// ... (getFilteredWords)

export const getRoomMessages = async (req: Request, res: Response) => {
    const { roomId } = req.params;
    try {
        const result = await query(`
            SELECT 
                m.id, m.user_id, m.content, m.created_at, m.username, 
                COALESCE(u.current_level, 1) as current_level, 
                COALESCE(u.permissions, '[]'::jsonb) as permissions,
                b.image_url as equipped_badge_image_url
            FROM room_messages m
            LEFT JOIN users u on m.user_id = u.id
            LEFT JOIN badges b on u.equipped_badge_id = b.id
            WHERE m.room_id = $1
            ORDER BY m.created_at DESC
            LIMIT 50
        `, [roomId]);
        res.json(result.rows.reverse());
    } catch (err) {
        res.status(500).json({ error: 'Could not load chat history.' });
    }
};

export const createRoomMessage = async (req: AuthRequest, res: Response) => {
    const { roomId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;
    const username = req.user?.username;
    const permissions = req.user?.permissions || [];

    // ... (validation)

    try {
        // ... (filtering)
        
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
