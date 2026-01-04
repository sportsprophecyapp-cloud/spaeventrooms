import { Response } from 'express';
import { AuthRequest } from '../auth/middleware';
import { gamificationService } from './GamificationService';

export const getMyStats = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const data = await gamificationService.getUserStats(userId);
        res.json(data);
    } catch (err) {
        console.error('Error fetching user stats:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getGlobalLeaderboard = async (req: AuthRequest, res: Response) => {
    // Basic leaderboard from user_stats
    try {
        const { query } = require('../database');
        const result = await query(`
            SELECT u.email, s.total_points, s.current_level
            FROM user_stats s
            JOIN users u ON s.user_id = u.id
            ORDER BY s.total_points DESC
            LIMIT 10
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching leaderboard:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
