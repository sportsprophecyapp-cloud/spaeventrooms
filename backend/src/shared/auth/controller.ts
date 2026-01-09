import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query as dbQuery } from '../database';
import { Request, Response } from 'express';
import { AuthRequest } from './middleware';
import { grantBadge } from '../badges/controller';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_keys_123';

export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const result = await dbQuery(`SELECT id, email, username, permissions, token_balance as tokens, total_points as points, total_tickets as tickets, current_level as level FROM users WHERE id = $1`, [userId]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Session expired' });
        res.json({ success: true, user: result.rows[0] });
    } catch (err) { res.status(500).json({ error: 'Verification failed' }); }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const result = await dbQuery('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });
        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) return res.status(401).json({ message: 'Invalid credentials' });
        const token = jwt.sign({ id: user.id, email: user.email, username: user.username, permissions: user.permissions }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, email: user.email, username: user.username, permissions: user.permissions, tokens: user.token_balance, tickets: user.total_tickets, points: user.total_points, level: user.current_level } });
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

export const register = async (req: Request, res: Response) => {
    const { email, password, username, ref } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await dbQuery(`INSERT INTO users (email, username, password_hash, referred_by) VALUES ($1, $2, $3, $4) RETURNING *`, [email.toLowerCase(), username, hashedPassword, ref || null]);
        const newUser = result.rows[0];
        if (ref) {
            const referrerResult = await dbQuery('UPDATE users SET referral_count = referral_count + 1 WHERE id = $1 RETURNING referral_count', [ref]);
            const newRefCount = referrerResult.rows[0]?.referral_count;
            if (newRefCount) {
                if (newRefCount >= 100) await grantBadge(ref, 'The Icon');
                else if (newRefCount >= 50) await grantBadge(ref, 'The Ambassador');
                else if (newRefCount >= 25) await grantBadge(ref, 'Master Recruiter');
                else if (newRefCount >= 10) await grantBadge(ref, 'Elite Recruiter');
                else if (newRefCount >= 5) await grantBadge(ref, 'Super Recruiter');
                else if (newRefCount >= 1) await grantBadge(ref, 'Recruiter');
            }
        }
        await grantBadge(newUser.id, 'First Prophecy');
        const token = jwt.sign({ id: newUser.id, email: newUser.email, username: newUser.username, permissions: newUser.permissions }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ success: true, user: newUser, token });
    } catch (error) { res.status(500).json({ success: false, error: 'Server error during registration.' }); }
};

export const updateUsername = async (req: AuthRequest, res: Response) => {
    // ... (implementation)
};

export const getProfile = async (req: Request, res: Response) => {
    // ... (implementation)
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
    // ... (implementation)
};

export const resetAdminPassword = async (req: Request, res: Response) => {
    // ... (implementation)
};

export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email address is required.' });
    try {
        const userResult = await dbQuery('SELECT id FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) return res.json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
        const user = userResult.rows[0];
        const resetToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
        console.log(`[PASSWORD RESET] Token for user ${user.id}: ${resetToken}`);
        res.json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
    } catch (err) { res.status(500).json({ error: 'A server error occurred.' }); }
};
