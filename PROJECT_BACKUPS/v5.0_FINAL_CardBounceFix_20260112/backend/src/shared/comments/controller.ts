import { Response } from 'express';
import { query } from '../database';
import { AuthRequest } from '../auth/middleware';
import { socketService } from '../socket/SocketService';

export const getComments = async (req: AuthRequest, res: Response) => {
    const { predictionId } = req.params;

    try {
        const result = await query(`
            SELECT c.*, u.username 
            FROM prediction_comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.prediction_id = $1
            ORDER BY c.created_at ASC
        `, [predictionId]);

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching comments:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const createComment = async (req: AuthRequest, res: Response) => {
    const { predictionId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    if (!content) {
        return res.status(400).json({ message: 'Content is required' });
    }

    try {
        // Fetch user handle for socket and display
        const userResult = await query('SELECT username FROM users WHERE id = $1', [userId]);
        const username = userResult.rows[0].username;

        const result = await query(
            'INSERT INTO prediction_comments (prediction_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
            [predictionId, userId, content]
        );

        const newComment = result.rows[0];
        newComment.username = username;

        // Emit socket event to the correct room namespace
        const predResult = await query('SELECT room_id FROM custom_predictions WHERE id = $1', [predictionId]);
        if (predResult.rows.length > 0) {
            const roomId = predResult.rows[0].room_id;
            socketService.emitToRoom(roomId, 'comment_new', newComment);
        }

        res.status(201).json(newComment);
    } catch (err) {
        console.error('Error creating comment:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
