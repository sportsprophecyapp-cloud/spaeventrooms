import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query as dbQuery } from '../database';
import { Request, Response } from 'express';
import { AuthRequest } from './middleware';
import { sendEmail } from '../services/emailService';
import { OAuth2Client } from 'google-auth-library';
import { generateReferralCode } from '../utils/referralCode';
import { ReferralService } from '../gamification/ReferralService';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_keys_123';

// RESTORED TO STABLE STATE: All original functions are fully implemented.

export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const result = await dbQuery(`SELECT id, email, username, permissions, token_balance, total_points, total_tickets, current_level, referral_code FROM users WHERE id = $1`, [userId]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Session expired' });

        const user = result.rows[0];

        // Lazy initialization of referral code for existing users
        if (!user.referral_code) {
            user.referral_code = generateReferralCode();
            await dbQuery('UPDATE users SET referral_code = $1 WHERE id = $2', [user.referral_code, userId]);
        }

        res.json({ success: true, user: { id: user.id, email: user.email, username: user.username, permissions: user.permissions, tokens: user.token_balance, tickets: user.total_tickets, points: user.total_points, level: user.current_level, referralCode: user.referral_code } });
    } catch (err) {
        res.status(500).json({ error: 'Verification failed' });
    }
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
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, username, referralCode } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const myReferralCode = generateReferralCode();

        const result = await dbQuery(
            `INSERT INTO users (email, username, password_hash, is_muted, token_balance, total_tickets, total_points, current_level, referral_code) 
             VALUES ($1, $2, $3, false, 150, 0, 0, 1, $4) RETURNING *`,
            [email.toLowerCase(), username, hashedPassword, myReferralCode]
        );
        const newUser = result.rows[0];

        // Process referral if provided
        if (referralCode) {
            await ReferralService.processReferral(newUser.id, referralCode);
        }

        const token = jwt.sign({ id: newUser.id, email: newUser.email, username: newUser.username, permissions: newUser.permissions }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            success: true,
            user: {
                id: newUser.id,
                email: newUser.email,
                username: newUser.username,
                permissions: newUser.permissions,
                tokens: newUser.token_balance,
                tickets: newUser.total_tickets,
                points: newUser.total_points,
                level: newUser.current_level,
                referralCode: newUser.referral_code
            },
            token
        });
    } catch (error) {
        console.error("[FATAL] User registration failed:", error);
        res.status(500).json({ success: false, error: 'Server error during registration.' });
    }
};

export const updateUsername = async (req: AuthRequest, res: Response) => {
    const { newUsername } = req.body;
    const userId = req.user?.id;
    if (!newUsername || newUsername.length < 3) return res.status(400).json({ success: false, error: 'Name must be at least 3 characters' });
    try {
        const check = await dbQuery('SELECT id FROM users WHERE username = $1 AND id != $2', [newUsername, userId]);
        if (check.rows.length > 0) return res.status(400).json({ success: false, error: 'Name already taken' });
        const result = await dbQuery('UPDATE users SET username = $1 WHERE id = $2 RETURNING id, username, email, permissions', [newUsername, userId]);
        res.json({ success: true, user: result.rows[0] });
    } catch (error) { res.status(500).json({ success: false, error: 'Server error' }); }
};

export const getProfile = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        // 1. Fetch Core User Data
        const userResult = await dbQuery(`
            SELECT id, username, email, token_balance, total_points, current_level, referral_code 
            FROM users WHERE id = $1`, [userId]);

        if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        const user = userResult.rows[0];

        // 2. Fetch Global Rank
        const rankResult = await dbQuery(`
            SELECT COUNT(*) + 1 as rank FROM users WHERE total_points > $1
        `, [user.total_points || 0]);
        const globalRank = parseInt(rankResult.rows[0].rank);

        // 3. Fetch Referral Count
        const referralResult = await dbQuery(`SELECT COUNT(*) as count FROM users WHERE referred_by_id = $1`, [userId]);
        const referralCount = parseInt(referralResult.rows[0].count) || 0;

        // 4. Fetch Recent Prediction History (Joining Soccer data for logos)
        const historyResult = await dbQuery(`
            SELECT 
                p.id, p.prediction_data->>'pick' as pick, p.created_at, p.result as status,
                m.home_team, m.away_team, m.home_logo, m.away_logo, m.score_home, m.score_away, m.start_time
            FROM soccer_predictions p
            JOIN soccer_matches m ON p.match_id = m.match_id
            WHERE p.user_id = $1
            ORDER BY p.created_at DESC
            LIMIT 10
        `, [userId]);

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                tokens: user.token_balance,
                tickets: user.total_tickets,
                points: user.total_points,
                level: user.current_level,
                referral_code: user.referral_code,
                global_rank: globalRank,
                referral_count: referralCount,
                history: historyResult.rows
            }
        });
    } catch (err) {
        console.error("Error in getProfile:", err);
        res.status(500).json({ error: 'Server error' });
    }
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { password } = req.body;
    if (!userId || !password) return res.status(400).json({ message: 'Authentication required' });
    try {
        const userResult = await dbQuery('SELECT password_hash FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) return res.status(404).json({ message: 'User not found.' });
        const user = userResult.rows[0];
        const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordCorrect) return res.status(403).json({ message: 'Incorrect password.' });
        await dbQuery('DELETE FROM users WHERE id = $1', [userId]);
        res.status(200).json({ success: true, message: 'Account has been permanently deleted.' });
    } catch (err) { res.status(500).json({ error: 'An error occurred during account deletion.' }); }
};

export const resetAdminPassword = async (req: Request, res: Response) => {
    // This is a sensitive operation and should be handled with care.
    const { password } = req.body;
    const emailToUpdate = 'sportsprophecyapp@gmail.com';
    if (!password || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await dbQuery('UPDATE users SET password_hash = $1, permissions = $2 WHERE email = $3', [hashedPassword, '["super_admin"]', emailToUpdate]);
        res.json({ success: true, message: 'Admin password has been successfully reset.' });
    } catch (error) { res.status(500).json({ error: 'Server error during password reset.' }); }
};

// RESTORED: Forgot Password Flow
export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
        const result = await dbQuery('SELECT id, username FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Email not found' });

        const user = result.rows[0];

        // Generate valid reset token (1 hour expiry)
        const token = jwt.sign({ id: user.id, type: 'reset' }, JWT_SECRET, { expiresIn: '1h' });

        // Use the Email Service (Handles both Dev Logging and Prod Sending)
        const resetLink = `http://${req.headers.host}/auth/reset?token=${token}`;

        await sendEmail({
            to: email,
            subject: 'Events Arena: Password Reset Request',
            text: `You requested a password reset. Click here: ${resetLink}`,
            html: `<p>You requested a password reset.</p><p><a href="${resetLink}">Click here to reset your password</a></p>`
        });

        res.json({ success: true, message: 'Reset link sent' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req: Request, res: Response) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        if (!payload || !payload.email) return res.status(400).json({ error: 'Invalid Google Token' });

        const { email, name, sub } = payload;

        // Check if User Exists
        const result = await dbQuery('SELECT * FROM users WHERE email = $1', [email]);

        let user;
        if (result.rows.length === 0) {
            // Create New User
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            const username = (name || 'user').replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000) || `user${Math.floor(Math.random() * 10000)}`;
            const myReferralCode = generateReferralCode();

            const newUser = await dbQuery(
                `INSERT INTO users (email, username, password_hash, is_muted, token_balance, total_tickets, total_points, current_level, permissions, referral_code) 
                 VALUES ($1, $2, $3, false, 150, 0, 0, 1, '["supporter"]', $4) RETURNING *`,
                [email, username, hashedPassword, myReferralCode]
            );
            user = newUser.rows[0];

            // Processing referral for Google signups (if we can pass referralCode in the body)
            const { referralCode } = req.body;
            if (referralCode) {
                await ReferralService.processReferral(user.id, referralCode);
            }
        } else {
            user = result.rows[0];
            // Lazy init referral code for existing Google users
            if (!user.referral_code) {
                user.referral_code = generateReferralCode();
                await dbQuery('UPDATE users SET referral_code = $1 WHERE id = $2', [user.referral_code, user.id]);
            }
        }

        const jwtToken = jwt.sign({ id: user.id, email: user.email, username: user.username, permissions: user.permissions }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ success: true, token: jwtToken, user: { id: user.id, email: user.email, username: user.username, permissions: user.permissions, tokens: user.token_balance, tickets: user.total_tickets, points: user.total_points, level: user.current_level, referralCode: user.referral_code } });

    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(401).json({ error: 'Google authentication failed' });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
    try {
        // Verify token
        const decoded: any = jwt.verify(token, JWT_SECRET);
        if (!decoded.id || decoded.type !== 'reset') return res.status(400).json({ error: 'Invalid token' });

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update User
        await dbQuery('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, decoded.id]);

        res.json({ success: true, message: 'Password successfully reset' });
    } catch (err) {
        res.status(400).json({ error: 'Invalid or expired token' });
    }
};

export const getPublicProfileByReferralCode = async (req: Request, res: Response) => {
    const { referralCode } = req.params;
    try {
        const result = await dbQuery('SELECT username FROM users WHERE referral_code = $1', [referralCode.toUpperCase()]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ success: true, username: result.rows[0].username });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};
