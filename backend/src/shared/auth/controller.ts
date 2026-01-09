import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query as dbQuery } from '../database';
import { Request, Response } from 'express';
import { AuthRequest } from './middleware';
import { grantBadge } from '../badges/controller';
import { sendEmail } from '../services/emailService'; // NEW

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_keys_123';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://www.sportsprophecyapp.com';

// ... (getMe, login, register, etc. remain the same) ...

export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email address is required.' });
    }

    try {
        const userResult = await dbQuery('SELECT id, username FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            // Security: Don't reveal if an email exists or not.
            return res.json({ success: true, message: 'If an account with this email exists, a reset link has been sent.' });
        }

        const user = userResult.rows[0];
        const resetToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });

        const resetLink = `${FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

        await sendEmail({
            to: email,
            subject: 'Your Events Arena Password Reset Link',
            text: `Hi ${user.username},\n\nSomeone requested a password reset for your Events Arena account. If this was you, please click the link below to reset your password. The link is valid for 1 hour.\n\n${resetLink}\n\nIf you did not request this, please ignore this email.\n\nThanks,\nThe Events Arena Team`,
            html: `<p>Hi ${user.username},</p><p>Someone requested a password reset for your Events Arena account. If this was you, please click the link below to reset your password. The link is valid for 1 hour.</p><p><a href="${resetLink}">Reset Your Password</a></p><p>If you did not request this, please ignore this email.</p><p>Thanks,<br/>The Events Arena Team</p>`
        });

        res.json({ success: true, message: 'If an account with this email exists, a reset link has been sent.' });

    } catch (err) {
        console.error("[FATAL] Forgot password process failed:", err);
        res.status(500).json({ error: 'A server error occurred while trying to reset your password.' });
    }
};

// ... (the rest of the controller)
