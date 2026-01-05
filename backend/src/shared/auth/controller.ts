import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query as dbQuery } from '../database';
import { Request, Response } from 'express';

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
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, user: { id: user.id, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * POST /api/auth/register
 * Register a new user with optional referral code
 * Body: { email, password, username, referralCode? }
 */
export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, username, referralCode } = req.body;

        // Validation needed
        if (!email || !password || !username) { // Username logic added here assuming schema update or intent
            // NOTE: Current schema in db-init.ts for `users` is just id, email, password_hash, created_at, token_balance.
            // It does NOT have username. For code consistency with user request I will adapt to email only if username column missing, 
            // OR I should assume Schema update was done/implied. 
            // User request implies username support. I will assume username is part of flow, but limit SQL to email if schema mismatch.
            // Re-reading db-init.ts: `email VARCHAR(255) UNIQUE NOT NULL`. 
            // I will STICK TO THE SCHEMA: email only. I will ignore username for DB insert to prevent crash.
            // FIX: User request had `username` and `referralCode`. Since `username` column DOES NOT EXIST in `users` table provided in db-init earlier,
            // I will only insert email/password.

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'email and password required',
                });
            }
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 8 characters',
            });
        }

        // Check if email exists
        const emailCheck = await dbQuery(
            `SELECT id FROM users WHERE email = $1`,
            [email.toLowerCase()]
        );

        if (emailCheck.rows.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Email already in use',
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        // NOTE: Inserting 'username' removed as column likely does not exist based on previous db-init view.
        const userResult = await dbQuery(
            `INSERT INTO users (email, password_hash, token_balance, created_at)
       VALUES ($1, $2, 0, NOW())
       RETURNING id, email`,
            [email.toLowerCase(), hashedPassword]
        );

        const newUser = userResult.rows[0];
        const newUserId = newUser.id;

        // Initialize user streak
        await dbQuery(
            `INSERT INTO user_streaks (user_id, current_streak, last_login_date, created_at)
       VALUES ($1, 0, NULL, NOW())`,
            [newUserId]
        );

        // Handle referral bonus
        if (referralCode) {
            try {
                // Decode referralCode to get referrer user ID
                // Assuming referralCode is userId (could be encoded, but simple integer for now)
                const referrerId = parseInt(referralCode, 10);

                if (!isNaN(referrerId) && referrerId > 0) {
                    // Verify referrer exists
                    const referrerCheck = await dbQuery(
                        `SELECT id FROM users WHERE id = $1`,
                        [referrerId]
                    );

                    if (referrerCheck.rows.length > 0) {
                        // Award referrer +50 tokens
                        await dbQuery(
                            `UPDATE users SET token_balance = token_balance + 50 WHERE id = $1`,
                            [referrerId]
                        );

                        // Log transaction
                        await dbQuery(
                            `INSERT INTO token_transactions (user_id, amount, type, description, created_at)
               VALUES ($1, 50, 'referral', $2, NOW())`,
                            [referrerId, `Referral Bonus - New user joined`] // removed username ref
                        );
                    }
                }
            } catch (error) {
                // Silently fail referral processing (don't block signup)
                console.warn('Error processing referral:', error);
            }
        }

        // Generate JWT
        const token = jwt.sign(
            { id: newUserId, email: newUser.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            user: {
                id: newUserId,
                email: newUser.email,
                // username: newUser.username, // removed
            },
            token,
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to register user',
        });
    }
};
