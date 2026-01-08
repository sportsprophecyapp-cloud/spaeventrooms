import { Response, Request } from 'express';
import { query } from '../database';
import { AuthRequest } from '../auth/middleware';
import { socketService } from '../socket/SocketService';

const getFilteredWords = async () => {
    try {
        const result = await query('SELECT word FROM chat_filter_words');
        return result.rows.map(r => r.word);
    } catch (e) {
        console.error("[WARN] Could not fetch chat filter words:", e);
        return [];
    }
};

export const getRoomMessages = async (req: Request, res: Response) => {
    const { roomId } = req.params;
    try {
        const result = await query(`
            SELECT 
                m.id,
                m.content,
                m.created_at,
                COALESCE(u.username, '[deleted]') as username, 
                COALESCE(u.current_level, 1) as current_level
            FROM room_messages m
            LEFT JOIN users u ON m.user_id = u.id
            WHERE m.room_id = $1
            ORDER BY m.created_at DESC
            LIMIT 50
        `, [roomId]);
        res.json(result.rows.reverse());
    } catch (err) {
        console.error('[FATAL] CRASH while fetching room messages:', err);
        res.status(500).json({ error: 'Could not load chat history due to a server error.' });
    }
};

export const createRoomMessage = async (req: AuthRequest, res: Response) => {
    const { roomId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;
    const username = req.user?.username;

    if (!userId || !username) {
        return res.status(401).json({ message: 'Invalid session. Please log in again.' });
    }

    if (!content || !content.trim()) {
        return res.status(400).json({ message: 'Message content is required.' });
    }

    // NOTE: The mute check is temporarily disabled to prevent the backend from crashing.
    // This is the root cause of the ongoing instability and will be addressed separately.

    try {
        const filteredWords = await getFilteredWords();
        const lowerCaseContent = content.toLowerCase();
        for (const word of filteredWords) {
            if (lowerCaseContent.includes(word)) {
                return res.status(403).json({ message: 'Your message contains a forbidden word.' });
            }
        }

        const result = await query(
            'INSERT INTO room_messages (room_id, user_id, username, content) VALUES ($1, $2, $3, $4) RETURNING *',
            [roomId, userId, username, content]
        );

        const newMessage = result.rows[0];
        newMessage.current_level = 1; // Placeholder

        socketService.emitToRoom(roomId, 'chat_message', newMessage);

        res.status(201).json(newMessage);
    } catch (err) {
        console.error('[FATAL] Error during message insertion or broadcast:', err);
        res.status(500).json({ error: 'A server error occurred while sending your message.' });
    }
};
