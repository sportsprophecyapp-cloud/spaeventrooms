import { Response, Request } from 'express';
import { query } from '../database';
import { AuthRequest } from '../auth/middleware';
import { socketService } from '../socket/SocketService';

// ... (getFilteredWords remains the same)

export const getRoomMessages = async (req: Request, res: Response) => {
    // ... (existing, corrected implementation)
};

export const createRoomMessage = async (req: AuthRequest, res: Response) => {
    const { roomId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    if (!content || !content.trim()) {
        return res.status(400).json({ message: 'Message content is required.' });
    }

    // 1. Verify User and Permissions
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

    // 2. Filter Message Content
    try {
        const filteredWords = await getFilteredWords();
        const lowerCaseContent = content.toLowerCase();
        for (const word of filteredWords) {
            if (lowerCaseContent.includes(word)) {
                return res.status(403).json({ message: 'Your message contains a forbidden word.' });
            }
        }
    } catch (err) {
        // This is unlikely to fail, but good to have.
        console.error("[FATAL] Chat filtering failed:", err);
    }

    // 3. Insert Message into Database
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

    // 4. Broadcast via Socket.io
    try {
        socketService.emitToRoom(roomId, 'chat_message', newMessage);
    } catch (err) {
        console.error("[FATAL] Socket.io broadcast failed:", err);
        // Note: The message is in the DB, but others won't see it in real-time.
        // The request still succeeds overall, as the message is persistent.
    }

    res.status(201).json(newMessage);
};
