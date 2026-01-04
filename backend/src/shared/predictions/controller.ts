import { Response } from 'express';
import { query } from '../database';
import { AuthRequest } from '../auth/middleware';
import { socketService } from '../socket/SocketService';

export const getPredictions = async (req: AuthRequest, res: Response) => {
    const { roomId } = req.params;

    try {
        const result = await query(
            'SELECT * FROM custom_predictions WHERE room_id = $1 ORDER BY created_at DESC',
            [roomId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching predictions:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const createPrediction = async (req: AuthRequest, res: Response) => {
    const { roomId } = req.params;
    const { question, options, closes_in_minutes } = req.body;
    const userId = req.user?.id;

    if (!question || !options || !Array.isArray(options)) {
        return res.status(400).json({ message: 'Question and options are required' });
    }

    try {
        const closesAt = closes_in_minutes
            ? new Date(Date.now() + closes_in_minutes * 60000)
            : null;

        const result = await query(
            `INSERT INTO custom_predictions (room_id, question, options, closes_at, created_by)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [roomId, question, JSON.stringify(options), closesAt, userId]
        );

        const prediction = result.rows[0];
        socketService.emitToRoom(roomId, 'prediction_new', prediction);

        res.status(201).json(prediction);
    } catch (err) {
        console.error('Error creating prediction:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const submitPrediction = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { option } = req.body;
    const userId = req.user?.id;

    if (!option) {
        return res.status(400).json({ message: 'Option is required' });
    }

    try {
        // Check if prediction is closed
        const predResult = await query('SELECT closes_at FROM custom_predictions WHERE id = $1', [id]);
        if (predResult.rows.length === 0) return res.status(404).json({ message: 'Prediction not found' });

        const closesAt = predResult.rows[0].closes_at;
        if (closesAt && new Date() > new Date(closesAt)) {
            return res.status(400).json({ message: 'Prediction is closed' });
        }

        await query(
            `INSERT INTO prediction_submissions (prediction_id, user_id, selected_option)
             VALUES ($1, $2, $3)
             ON CONFLICT (prediction_id, user_id) 
             DO UPDATE SET selected_option = EXCLUDED.selected_option, submitted_at = CURRENT_TIMESTAMP`,
            [id, userId, option]
        );

        res.json({ success: true, message: 'Prediction submitted' });
    } catch (err) {
        console.error('Error submitting prediction:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const revealAnswer = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { correctAnswer } = req.body;

    if (!correctAnswer) {
        return res.status(400).json({ message: 'Correct answer is required' });
    }

    try {
        await query(
            `UPDATE custom_predictions 
             SET correct_answer = $1, revealed_at = CURRENT_TIMESTAMP
             WHERE id = $2`,
            [correctAnswer, id]
        );

        // Score the submissions
        await query(
            `UPDATE prediction_submissions 
             SET is_correct = (selected_option = $1)
             WHERE prediction_id = $2`,
            [correctAnswer, id]
        );

        // Fetch roomId to emit event
        const roomInfo = await query('SELECT room_id FROM custom_predictions WHERE id = $1', [id]);
        if (roomInfo.rows.length > 0) {
            socketService.emitToRoom(roomInfo.rows[0].room_id, 'prediction_revealed', {
                id: parseInt(id),
                correctAnswer
            });
        }

        res.json({ success: true, message: 'Answer revealed and scored' });
    } catch (err) {
        console.error('Error revealing answer:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
