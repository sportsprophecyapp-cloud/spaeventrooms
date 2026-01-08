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
        // ULTRA-STABLE QUERY: Avoids selecting any potentially crashing columns (e.g., JSONB from users)
        // This is the same successful strategy used to fix the admin panel.
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

    if (!content || !content.trim()) {
        return res.status(400).json({ message: 'Message content is required.' });
    }

    let user;
    try {
        const userResult = await query('SELECT username, current_level, is_muted FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'Your user account could not be found.' });
        }
        user = userResult.rows[0];
        if (user.is_muted) {
            return res.status(403).json({ message: 'You are currently muted and cannot send messages.' });
        }
    } catch (err) {
        console.error("[FATAL] DB error verifying user for chat:", err);
        return res.status(500).json({ message: 'Server error while verifying your account.' });
    }

    try {
        const filteredWords = await getFilteredWords();
        const lowerCaseContent = content.toLowerCase();
        for (const word of filteredWords) {
            if (lowerCaseContent.includes(word)) {
                return res.status(403).json({ message: 'Your message contains a forbidden word.' });
            }
        }
    } catch (err) {
        console.error("[WARN] Chat filtering failed:", err);
    }

    let newMessage;
    try {
        const result = await query(
            'INSERT INTO room_messages (room_id, user_id, username, content) VALUES ($1, $2, $3, $4) RETURNING *',
            [roomId, userId, user.username, content]
        );
        newMessage = result.rows[0];
        newMessage.current_level = user.current_level;
    } catch (err) {
        console.error("[FATAL] DB error inserting chat message:", err);
        return res.status(500).json({ message: 'Failed to save your message to the database.' });
    }

    try {
        socketService.emitToRoom(roomId, 'chat_message', newMessage);
    } catch (err) {
        console.error("[WARN] Socket.io broadcast failed:", err);
    }

    res.status(201).json(newMessage);
};
