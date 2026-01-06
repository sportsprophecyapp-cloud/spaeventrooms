import { Response, Request } from 'express';
import { query } from '../database';
import { AuthRequest } from '../auth/middleware';
import { socketService } from '../socket/SocketService';

export const getRoomMessages = async (req: Request, res: Response) => {
    const { roomId } = req.params;

    try {
        const result = await query(`
            SELECT m.*, u.username, u.current_level
            FROM room_messages m
            JOIN users u ON m.user_id = u.id
            WHERE m.room_id = $1
            ORDER BY m.created_at DESC
            LIMIT 50
        `, [roomId]);

        // Return in chronological order for the frontend
        res.json(result.rows.reverse());
    } catch (err) {
        console.error('Error fetching room messages:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const createRoomMessage = async (req: AuthRequest, res: Response) => {
    const { roomId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    if (!content || !content.trim()) {
        return res.status(400).json({ message: 'Message content is required' });
    }

    try {
        // Fetch user info for the message
        const userResult = await query('SELECT username, current_level FROM users WHERE id = $1', [userId]);
        const user = userResult.rows[0];

        const result = await query(
            'INSERT INTO room_messages (room_id, user_id, username, content) VALUES ($1, $2, $3, $4) RETURNING *',
            [roomId, userId, user.username, content]
        );

        const newMessage = result.rows[0];
        newMessage.current_level = user.current_level;

        // Emit real-time to everyone in the room
        socketService.emitToRoom(roomId, 'chat_message', newMessage);

        res.status(201).json(newMessage);
    } catch (err) {
        console.error('Error creating chat message:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
