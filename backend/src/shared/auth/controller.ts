import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query as dbQuery } from '../database';
import { Request, Response } from 'express';
import { AuthRequest } from './middleware';
import { grantBadge } from '../badges/controller';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_keys_123';

// ... (other functions remain the same)

export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email address is required.' });
    }

    try {
        const userResult = await dbQuery('SELECT id FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            // We don't want to reveal if an email exists or not for security reasons
            return res.json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
        }

        const user = userResult.rows[0];
        const resetToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });

        // TODO: In a real application, you would email this token to the user.
        // For now, we will log it to the console for testing.
        console.log(`[PASSWORD RESET] Token for user ${user.id}: ${resetToken}`);

        res.json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });

    } catch (err) {
        console.error("[FATAL] Forgot password failed:", err);
        res.status(500).json({ error: 'A server error occurred.' });
    }
};

// ... (rest of the controller)
