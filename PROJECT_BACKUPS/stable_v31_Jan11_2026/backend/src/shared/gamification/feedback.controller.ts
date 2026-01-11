import { Request, Response } from 'express';
import { query as dbQuery } from '../database';
import { AuthRequest } from '../auth/middleware';

export const submitFeedback = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { drawId, rating, comment } = req.body;

        if (!drawId || !rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Invalid feedback data' });
        }

        const result = await dbQuery(
            `INSERT INTO winner_feedback (user_id, draw_id, rating, comment)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [userId, drawId, rating, comment]
        );

        res.json({ success: true, feedbackId: result.rows[0].id });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ error: 'Failed to submit feedback' });
    }
};

export const trackShare = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { feedbackId, platform } = req.body;

        await dbQuery(
            `UPDATE winner_feedback 
             SET is_shared = true, shared_platform = $1 
             WHERE id = $2 AND user_id = $3`,
            [platform, feedbackId, userId]
        );

        // Optional: Award a small token bonus for sharing
        await dbQuery(
            `UPDATE users SET tokens = tokens + 10 WHERE id = $1`,
            [userId]
        );

        res.json({ success: true, message: 'Share tracked and 10 tokens awarded!' });
    } catch (error) {
        console.error('Error tracking share:', error);
        res.status(500).json({ error: 'Failed to track share' });
    }
};

export const getAllFeedback = async (req: AuthRequest, res: Response) => {
    try {
        // Admin check should be handled by middleware, but good to have here as well
        const result = await dbQuery(
            `SELECT wf.*, u.username, pd.prize_name
             FROM winner_feedback wf
             JOIN users u ON wf.user_id = u.id
             JOIN prize_draws pd ON wf.draw_id = pd.id
             ORDER BY wf.created_at DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({ error: 'Failed to fetch feedback' });
    }
};
