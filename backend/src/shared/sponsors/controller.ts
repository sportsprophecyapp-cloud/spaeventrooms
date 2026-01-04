import { Response } from 'express';
import { query } from '../database';
import { AuthRequest } from '../auth/middleware';

export const getSponsors = async (req: AuthRequest, res: Response) => {
    const { roomId } = req.params;

    try {
        const result = await query(
            'SELECT * FROM room_sponsors WHERE room_id = $1 AND is_active = TRUE ORDER BY created_at DESC',
            [roomId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching sponsors:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const createSponsor = async (req: AuthRequest, res: Response) => {
    const { roomId } = req.params;
    const { name, logo_url, link_url } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Sponsor name is required' });
    }

    try {
        const result = await query(
            `INSERT INTO room_sponsors (room_id, name, logo_url, link_url)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [roomId, name, logo_url, link_url]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating sponsor:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const deleteSponsor = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
        await query('UPDATE room_sponsors SET is_active = FALSE WHERE id = $1', [id]);
        res.json({ success: true, message: 'Sponsor removed' });
    } catch (err) {
        console.error('Error deleting sponsor:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
