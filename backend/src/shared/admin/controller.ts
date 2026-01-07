import { Request, Response } from 'express';
import { query } from '../database';

// GET /api/admin/users/search?query=name
export const searchProphets = async (req: Request, res: Response) => {
    const { query: searchTerm } = req.query;
    if (!searchTerm) return res.status(400).json({ error: 'Search term required' });

    try {
        const result = await query(`
            SELECT id, username, email, role, current_level 
            FROM users 
            WHERE username ILIKE $1 OR email ILIKE $1
            LIMIT 10
        `, [`%${searchTerm}%`]);

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Search failed' });
    }
};

// PUT /api/admin/users/:userId/role
export const updateUserRole = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { role } = req.body;

    const validRoles = ['admin', 'creator', 'prophet'];
    if (!validRoles.includes(role)) return res.status(400).json({ error: 'Invalid role' });

    try {
        await query('UPDATE users SET role = $1 WHERE id = $2', [role, userId]);
        res.json({ success: true, message: 'Role updated' });
    } catch (err) {
        res.status(500).json({ error: 'Update failed' });
    }
};

// GET /api/admin/rooms
export const getRooms = async (req: Request, res: Response) => {
    try {
        const result = await query(`
            SELECT r.*, u.username as owner_name 
            FROM rooms r 
            LEFT JOIN users u ON r.owner_id = u.id
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Fetch failed' });
    }
};

// PUT /api/admin/rooms/:roomId/owner
export const assignRoomOwner = async (req: Request, res: Response) => {
    const { roomId } = req.params;
    const { ownerId } = req.body;

    try {
        await query('UPDATE rooms SET owner_id = $1 WHERE room_id = $2', [ownerId, roomId]);
        res.json({ success: true, message: 'Owner assigned' });
    } catch (err) {
        res.status(500).json({ error: 'Assignment failed' });
    }
};
