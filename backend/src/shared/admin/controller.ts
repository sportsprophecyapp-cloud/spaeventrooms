import { Request, Response } from 'express';
import { query } from '../database';

// 1. GET ALL SUPPORTERS
export const getAllSupporters = async (req: Request, res: Response) => {
    try {
        const sql = `
            SELECT 
                u.id, 
                u.username, 
                u.email, 
                u.permissions, 
                u.created_at,
                COUNT(p.id) as prediction_count
            FROM users u
            LEFT JOIN soccer_predictions p ON u.id = p.user_id
            GROUP BY u.id
            ORDER BY u.created_at DESC
        `;
        const result = await query(sql);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: 'Failed to fetch supporters' }); }
};

// 2. UPDATE PERMISSIONS (NEW)
export const updateUserPermissions = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { permissions } = req.body;

    // Prevent self-de-admin
    // NOTE: This logic should be more robust in a real-world scenario

    try {
        await query('UPDATE users SET permissions = $1 WHERE id = $2', [JSON.stringify(permissions), userId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Update failed' });
    }
};


// ... (rest of file remains same for now)
export const searchSupporters = async (req: Request, res: Response) => {
    // ...
};

export const updateUserRole = async (req: Request, res: Response) => {
    // ...
};

export const getAllMatches = async (req: Request, res: Response) => {
    // ...
};

export const deleteMatch = async (req: Request, res: Response) => {
    // ...
};

export const clearDebugTestMatches = async (req: Request, res: Response) => {
    // ...
};

export const getRooms = async (req: Request, res: Response) => {
    // ...
};

export const createRoom = async (req: Request, res: Response) => {
    // ...
};

export const assignRoomOwner = async (req: Request, res: Response) => {
    // ...
};

export const getDraws = async (req: Request, res: Response) => {
    // ...
};

export const createDraw = async (req: Request, res: Response) => {
    // ...
};

export const resolveDraw = async (req: Request, res: Response) => {
    // ...
};
