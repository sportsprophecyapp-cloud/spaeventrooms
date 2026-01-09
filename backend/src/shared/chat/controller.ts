import { Response, Request } from 'express';
import { query } from '../database';
import { AuthRequest } from '../auth/middleware';
import { socketService } from '../socket/SocketService';

// ... (getRoomMessages remains the same)

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

        // FINAL FIX: Emit directly to the room's namespace for maximum reliability.
        socketService.getIO()?.of(`/rooms/${roomId}`).emit('chat_message', newMessage);

        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ error: 'A server error occurred.' });
    }
};
