import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query as dbQuery } from '../database';
import { Request, Response } from 'express';
import { AuthRequest } from './middleware';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_keys_123';

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const result = await dbQuery('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, username: user.username },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ 
            token, 
            user: { 
                id: user.id, 
                email: user.email, 
                username: user.username,
                tokens: user.token_balance,
                points: user.total_points,
                level: user.current_level
            } 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, username, referred_by } = req.body;

        if (!email || !password || !username) {
            return res.status(400).json({ success: false, error: 'Email, password, and username required' });
        }

        const check = await dbQuery('SELECT id FROM users WHERE email = $1 OR username = $2', [email.toLowerCase(), username]);
        if (check.rows.length > 0) {
            return res.status(400).json({ success: false, error: 'Email or Username already taken' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let startingBalance = 150;
        if (referred_by) startingBalance += 50;

        const result = await dbQuery(
            `INSERT INTO users (email, username, password_hash, token_balance) 
             VALUES ($1, $2, $3, $4) RETURNING id, email, username`,
            [email.toLowerCase(), username, hashedPassword, startingBalance]
        );

        const newUser = result.rows[0];

        if (referred_by) {
            try {
                const refCheck = await dbQuery('UPDATE users SET token_balance = token_balance + 50 WHERE id = $1 RETURNING username', [referred_by]);
                
                if (refCheck.rows.length > 0) {
                    const referrerName = refCheck.rows[0].username;
                    await dbQuery(
                        'INSERT INTO token_transactions (user_id, amount, type, description) VALUES ($1, 50, $2, $3)',
                        [referred_by, 'referral', `Referral Bonus: @${newUser.username} joined the arena`]
                    );
                    await dbQuery(
                        'INSERT INTO token_transactions (user_id, amount, type, description) VALUES ($1, 50, $2, $3)',
                        [newUser.id, 'referral', `Welcome Bonus: Referred by @${referrerName}`]
                    );
                }
            } catch (refErr) {
                console.warn('Referral award failed:', refErr);
            }
        }

        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, username: newUser.username },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({ success: true, user: newUser, token });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

export const updateUsername = async (req: AuthRequest, res: Response) => {
    const { newUsername } = req.body;
    const userId = req.user?.id;

    if (!newUsername || newUsername.length < 3) {
        return res.status(400).json({ success: false, error: 'Name must be at least 3 characters' });
    }

    try {
        const check = await dbQuery('SELECT id FROM users WHERE username = $1 AND id != $2', [newUsername, userId]);
        if (check.rows.length > 0) {
            return res.status(400).json({ success: false, error: 'Name already taken' });
        }

        const result = await dbQuery(
            'UPDATE users SET username = $1 WHERE id = $2 RETURNING id, username, email',
            [newUsername, userId]
        );

        res.json({ success: true, user: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

export const getProfile = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const result = await dbQuery(`
            SELECT id, username, email, token_balance as tokens, total_points as points, current_level as level
            FROM users WHERE id = $1
        `, [userId]);

        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json({ success: true, user: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};
