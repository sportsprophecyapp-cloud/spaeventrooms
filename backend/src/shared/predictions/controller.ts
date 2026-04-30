import { Response } from 'express';
import { query } from '../database';
import { AuthRequest } from '../auth/middleware';
import { socketService } from '../socket/SocketService';
import { gamificationService } from '../gamification/GamificationService';

const PREDICTION_COST = 10;

export const submitMatchPrediction = async (req: AuthRequest, res: Response) => {
    const { matchId, pick } = req.body;
    const { roomId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (!matchId || !pick) {
        return res.status(400).json({ message: 'Match ID and pick are required' });
    }

    try {
        // 1. Check user exists
        const userResult = await query('SELECT token_balance FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 2. Insert prediction in a transaction
        await query('BEGIN');
        
        if (roomId === 'nhl') {
            await query(
                `INSERT INTO nhl_predictions (user_id, match_id, prediction_data)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (user_id, match_id) 
                 DO UPDATE SET prediction_data = EXCLUDED.prediction_data`,
                [userId, matchId, { pick }]
            );
        } else {
            // Default to soccer
            await query(
                `INSERT INTO soccer_predictions (user_id, match_id, prediction_data)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (user_id, match_id) 
                 DO UPDATE SET prediction_data = EXCLUDED.prediction_data`,
                [userId, matchId, { pick }]
            );
        }
        
        await query('COMMIT');

        // 3. Award points for participation
        await gamificationService.awardPoints(userId, 10);

        res.status(201).json({ success: true, message: 'Match prediction submitted' });
    } catch (err) {
        await query('ROLLBACK');
        console.error('Error submitting match prediction:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getUserMatchPrediction = async (req: AuthRequest, res: Response) => {
    const { matchId } = req.query;
    const { roomId } = req.params;
    const userId = req.user?.id;

    if (!userId || !matchId) {
        return res.json(null);
    }

    try {
        const table = roomId === 'nhl' ? 'nhl_predictions' : 'soccer_predictions';
        console.log(`🔍 Checking prediction for user: ${userId}, match: ${matchId}, room: ${roomId}, table: ${table}`);
        
        if (!matchId) {
            console.warn('⚠️ Missing matchId in getUserMatchPrediction');
            return res.json(null);
        }

        const result = await query(
            `SELECT prediction_data FROM ${table} WHERE user_id = $1 AND match_id = $2`,
            [userId, matchId]
        );

        if (result && result.rows && result.rows.length > 0) {
            return res.json(result.rows[0].prediction_data);
        } else {
            return res.json(null);
        }
    } catch (err: any) {
        console.error('❌ FATAL in getUserMatchPrediction:', err.message, { userId, matchId, roomId });
        return res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
};

export const getMatchSentiment = async (req: AuthRequest, res: Response) => {
    const { matchId } = req.params;
    const { roomId } = req.params;

    try {
        const table = roomId === 'nhl' ? 'nhl_predictions' : 'soccer_predictions';
        
        const result = await query(
            `SELECT 
                p.prediction_data->>'pick' as pick,
                COUNT(*) as count,
                m.home_team,
                m.away_team
             FROM ${table} p
             JOIN ${table.replace('_predictions', '_matches')} m ON p.match_id = m.match_id
             WHERE p.match_id = $1
             GROUP BY p.prediction_data->>'pick', m.home_team, m.away_team`,
            [matchId]
        );

        const counts: Record<string, number> = { home: 0, away: 0, draw: 0 };
        let total = 0;

        result.rows.forEach(row => {
            if (row.pick === row.home_team) {
                counts.home = parseInt(row.count);
                total += parseInt(row.count);
            } else if (row.pick === row.away_team) {
                counts.away = parseInt(row.count);
                total += parseInt(row.count);
            } else if (row.pick === 'draw') {
                counts.draw = parseInt(row.count);
                total += parseInt(row.count);
            }
        });

        const percentages = {
            home: total > 0 ? Math.round((counts.home / total) * 100) : 0,
            away: total > 0 ? Math.round((counts.away / total) * 100) : 0,
            draw: total > 0 ? Math.round((counts.draw / total) * 100) : 0,
            total
        };

        res.json({ counts, percentages });
    } catch (err) {
        console.error('Error fetching match sentiment:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

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

        // Award engagement points
        if (userId) {
            await gamificationService.awardPoints(userId, 10);
        }

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

        // Award points to winners
        const winnersResult = await query(
            'SELECT user_id FROM prediction_submissions WHERE prediction_id = $1 AND is_correct = true',
            [id]
        );

        for (const row of winnersResult.rows) {
            await gamificationService.awardPoints(row.user_id, 100);
        }

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
