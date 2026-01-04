import { Response } from 'express';
import { query } from '../database';
import { AuthRequest } from '../auth/middleware';

export const getAnnouncements = async (req: AuthRequest, res: Response) => {
    const { roomId } = req.params;

    try {
        const result = await query(
            'SELECT * FROM announcements WHERE room_id = $1 AND is_draft = false ORDER BY published_at DESC LIMIT 10',
            [roomId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching announcements:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const createAnnouncement = async (req: AuthRequest, res: Response) => {
    const { roomId } = req.params;
    const { type, title, description, scheduled_for } = req.body;
    const userId = req.user?.id;

    if (!title) {
        return res.status(400).json({ message: 'Title is required' });
    }

    try {
        const result = await query(
            `INSERT INTO announcements (room_id, type, title, description, scheduled_for, published_at, is_draft, created_by)
             VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, false, $6)
             RETURNING *`,
            [roomId, type || 'general', title, description, scheduled_for, userId]
        );

        // TODO: Emit socket event for real-time update

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating announcement:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
