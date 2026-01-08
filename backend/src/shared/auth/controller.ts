import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query as dbQuery } from '../database';
import { Request, Response } from 'express';
import { AuthRequest } from './middleware';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_keys_123';

// FIXED: Use 'permissions' instead of the deleted 'role' column
export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const result = await dbQuery(`
            SELECT 
                id, email, username, permissions, 
                token_balance as tokens, total_points as points, 
                total_tickets as tickets, current_level as level
            FROM users WHERE id = $1
        `, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Session expired' });
        }

        res.json({ success: true, user: result.rows[0] });
    } catch (err) {
        console.error('Auth /me Error:', err);
        res.status(500).json({ error: 'Verification failed' });
    }
};

// FIXED: Use 'permissions' in login response
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
            { id: user.id, email: user.email, username: user.username, permissions: user.permissions }, // Add permissions to JWT
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ 
            token, 
            user: { 
                id: user.id, 
                email: user.email, 
                username: user.username,
                permissions: user.permissions,
                tokens: user.token_balance,
                tickets: user.total_tickets,
                points: user.total_points,
                level: user.current_level
            } 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// ... (register and other functions remain largely the same, but should be audited)
export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, username } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await dbQuery(
            `INSERT INTO users (email, username, password_hash) 
             VALUES ($1, $2, $3) RETURNING id, email, username, permissions`,
            [email.toLowerCase(), username, hashedPassword]
        );

        const newUser = result.rows[0];
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, username: newUser.username, permissions: newUser.permissions },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        res.status(201).json({ success: true, user: newUser, token });
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
