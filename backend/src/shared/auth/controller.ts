import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query as dbQuery } from '../database';
import { Request, Response } from 'express';
import { AuthRequest } from './middleware';
import { grantBadge } from '../badges/controller'; // NEW

// ... (JWT_SECRET and other functions)

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, username, ref } = req.body; // NEW: Added ref
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the new user
        const result = await dbQuery(
            `INSERT INTO users (email, username, password_hash, referred_by) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [email.toLowerCase(), username, hashedPassword, ref || null]
        );

        const newUser = result.rows[0];

        // If there was a referrer, update their stats and award badges
        if (ref) {
            const referrerResult = await dbQuery(
                'UPDATE users SET referral_count = referral_count + 1 WHERE id = $1 RETURNING referral_count',
                [ref]
            );
            const newRefCount = referrerResult.rows[0]?.referral_count;

            // Award badges based on the new count
            if (newRefCount) {
                if (newRefCount >= 100) await grantBadge(ref, 'The Icon');
                else if (newRefCount >= 50) await grantBadge(ref, 'The Ambassador');
                else if (newRefCount >= 25) await grantBadge(ref, 'Master Recruiter');
                else if (newRefCount >= 10) await grantBadge(ref, 'Elite Recruiter');
                else if (newRefCount >= 5) await grantBadge(ref, 'Super Recruiter');
                else if (newRefCount >= 1) await grantBadge(ref, 'Recruiter');
            }
        }

        // Award the "First Prophecy" badge to the new user for making an account
        await grantBadge(newUser.id, 'First Prophecy');

        const token = jwt.sign(/* ... */); // Create token

        res.status(201).json({ 
            success: true, 
            user: { /* ... (return full user object) */ }, 
            token 
        });

    } catch (error) {
        console.error("[FATAL] User registration failed:", error);
        res.status(500).json({ success: false, error: 'Server error during registration.' });
    }
};

// ... (rest of the functions remain the same)
