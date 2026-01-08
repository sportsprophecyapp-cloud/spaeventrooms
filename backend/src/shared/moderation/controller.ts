import { Request, Response } from 'express';
import { query } from '../database';

// 1. GET ALL FILTERED WORDS
export const getFilteredWords = async (req: Request, res: Response) => {
    try {
        const result = await query('SELECT * FROM chat_filter_words ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: 'Failed to fetch filtered words' }); }
};

// 2. ADD FILTERED WORD
export const addFilteredWord = async (req: Request, res: Response) => {
    const { word } = req.body;
    if (!word) {
        return res.status(400).json({ error: 'Word is required' });
    }
    try {
        const result = await query('INSERT INTO chat_filter_words (word) VALUES ($1) RETURNING *', [word.toLowerCase()]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Word may already exist or another error occurred.' });
    }
};

// 3. DELETE FILTERED WORD
export const deleteFilteredWord = async (req: Request, res: Response) => {
    const { wordId } = req.params;
    try {
        await query('DELETE FROM chat_filter_words WHERE id = $1', [wordId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete word' });
    }
};
