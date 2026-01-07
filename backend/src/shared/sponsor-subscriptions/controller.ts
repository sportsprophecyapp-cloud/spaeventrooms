import { Request, Response } from 'express';
import { query } from '../database';
import stripe from '../stripe/client';

// Public Partnership Email for Notifications
const ADMIN_EMAIL = 'partnerships@sportsprophecyapp.com';

export const getAdminSponsors = async (req: Request, res: Response) => {
    try {
        const result = await query(`
            SELECT s.*, sub.tier, sub.status as subscriptionStatus, sub.expires_at
            FROM room_sponsors s
            LEFT JOIN sponsor_subscriptions sub ON s.id = sub.sponsor_id
            ORDER BY s.created_at DESC
        `);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch admin sponsors' });
    }
};

export const toggleSponsorActive = async (req: Request, res: Response) => {
    const { sponsorId } = req.params;
    const { isActive } = req.body;
    try {
        await query('UPDATE room_sponsors SET is_active = $1 WHERE id = $2', [isActive, sponsorId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to toggle sponsor' });
    }
};

export const getPlacementsByRoom = async (req: Request, res: Response) => {
    const { roomId } = req.params;
    try {
        const result = await query(`
            SELECT name, logo_url, link_url FROM room_sponsors 
            WHERE (room_id = $1 OR room_id IS NULL) AND is_active = TRUE
        `, [roomId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch placements' });
    }
};
