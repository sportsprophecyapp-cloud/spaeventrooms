import { Request, Response } from 'express';
import { query } from '../database';
import { pickWinner } from '../services/drawService';

// 1. GET ALL SUPPORTERS
export const getAllSupporters = async (req: Request, res: Response) => {
    try {
        const result = await query('SELECT id, username, email, role, current_level, created_at FROM users ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: 'Failed to fetch supporters' }); }
};

// 2. SEARCH SUPPORTERS
export const searchSupporters = async (req: Request, res: Response) => {
    const { query: searchTerm } = req.query;
    if (!searchTerm) return res.status(400).json({ error: 'Search term required' });
    try {
        const result = await query(`
            SELECT id, username, email, role, current_level FROM users 
            WHERE username ILIKE $1 OR email ILIKE $1 LIMIT 10
        `, [`%${searchTerm}%`]);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: 'Search failed' }); }
};

// 3. UPDATE ROLE
export const updateUserRole = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { role } = req.body;
    try {
        await query('UPDATE users SET role = $1 WHERE id = $2', [role, userId]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Update failed' }); }
};

// ... (rest of file remains same)

// MATCH MANAGEMENT
export const getAllMatches = async (req: Request, res: Response) => {
    try {
        const result = await query('SELECT * FROM soccer_matches ORDER BY start_time DESC LIMIT 50');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: 'Fetch failed' }); }
};

export const deleteMatch = async (req: Request, res: Response) => {
    const { matchId } = req.params;
    try {
        await query('DELETE FROM soccer_matches WHERE match_id = $1', [matchId]);
        res.json({ success: true, message: `Match ${matchId} deleted.` });
    } catch (err) { res.status(500).json({ error: 'Delete failed' }); }
};

export const clearDebugTestMatches = async (req: Request, res: Response) => {
    try {
        const result = await query("DELETE FROM soccer_matches WHERE match_id LIKE 'test-%'");
        res.json({ success: true, count: result.rowCount });
    } catch (err) { res.status(500).json({ error: 'Clear failed' }); }
};

// ROOMS
export const getRooms = async (req: Request, res: Response) => {
    try {
        const result = await query('SELECT r.*, u.username as owner_name FROM rooms r LEFT JOIN users u ON r.owner_id = u.id');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: 'Fetch failed' }); }
};

export const createRoom = async (req: Request, res: Response) => {
    const { room_id, display_name, owner_email } = req.body;
    try {
        const ownerResult = await query('SELECT id FROM users WHERE email = $1', [owner_email]);
        const ownerId = ownerResult.rows.length > 0 ? ownerResult.rows[0].id : null;

        const result = await query(
            'INSERT INTO rooms (room_id, display_name, owner_id) VALUES ($1, $2, $3) RETURNING *',
            [room_id, display_name, ownerId]
        );

        if (ownerId) {
            await query("UPDATE users SET role = 'creator' WHERE id = $1", [ownerId]);
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Room generation failed' });
    }
};

export const assignRoomOwner = async (req: Request, res: Response) => {
    const { roomId } = req.params;
    const { ownerId } = req.body;
    try {
        await query('UPDATE rooms SET owner_id = $1 WHERE room_id = $2', [ownerId, roomId]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Assignment failed' }); }
};

// PRIZE DRAWS
export const getDraws = async (req: Request, res: Response) => {
    try {
        const result = await query(`
            SELECT d.*, u.username as winner_name, s.name as sponsor_name 
            FROM prize_draws d 
            LEFT JOIN users u ON d.winner_id = u.id
            LEFT JOIN room_sponsors s ON d.sponsor_id = s.id
            ORDER BY d.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: 'Fetch draws failed' }); }
};

export const createDraw = async (req: Request, res: Response) => {
    const { title, prize_description, roomId, sponsorId } = req.body;
    try {
        const result = await query(
            'INSERT INTO prize_draws (title, prize_description, room_id, sponsor_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, prize_description, roomId, sponsorId]
        );
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: 'Create draw failed' }); }
};

export const resolveDraw = async (req: Request, res: Response) => {
    const { drawId, prizeCount } = req.body;
    try {
        const halfPrizes = Math.floor(prizeCount / 2);
        const skillWinners = await query(`SELECT u.id, u.username FROM users u ORDER BY total_points DESC LIMIT $1`, [halfPrizes]);
        const luckyWinner = await pickWinner(drawId);
        res.json({ success: true, skillWinners: skillWinners.rows, luckyWinner });
    } catch (err) { res.status(500).json({ error: 'Resolution failed' }); }
};
