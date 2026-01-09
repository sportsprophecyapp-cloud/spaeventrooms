import { Response } from 'express';
import { query } from '../database';
import { AuthRequest } from '../auth/middleware';

// 1. Get all badges a user has unlocked
export const getMyBadges = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Authentication required.' });

    try {
        const result = await query(`
            SELECT b.id, b.name, b.description, b.image_url
            FROM badges b
            JOIN user_unlocked_badges uub ON b.id = uub.badge_id
            WHERE uub.user_id = $1
        `, [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error("[FATAL] Could not get user badges:", err);
        res.status(500).json({ error: 'Server error while fetching your badges.' });
    }
};

// 2. Allow a user to equip a badge
export const equipBadge = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { badgeId } = req.body;
    if (!userId) return res.status(401).json({ message: 'Authentication required.' });
    if (!badgeId) return res.status(400).json({ message: 'Badge ID is required.' });

    try {
        // First, verify the user actually owns this badge
        const ownershipCheck = await query(
            'SELECT id FROM user_unlocked_badges WHERE user_id = $1 AND badge_id = $2',
            [userId, badgeId]
        );

        if (ownershipCheck.rows.length === 0) {
            return res.status(403).json({ message: 'You have not unlocked this badge.' });
        }

        // Now, equip it
        await query('UPDATE users SET equipped_badge_id = $1 WHERE id = $2', [badgeId, userId]);

        res.json({ success: true, message: 'Badge equipped!' });
    } catch (err) {
        console.error("[FATAL] Could not equip badge:", err);
        res.status(500).json({ error: 'Server error while equipping badge.' });
    }
};

// 3. Grant a badge to a user (Admin or system action)
export const grantBadge = async (userId: number, badgeName: string): Promise<boolean> => {
    try {
        await query(`
            INSERT INTO user_unlocked_badges (user_id, badge_id)
            SELECT $1, id FROM badges WHERE name = $2
            ON CONFLICT (user_id, badge_id) DO NOTHING
        `, [userId, badgeName]);
        console.log(`Attempted to grant badge '${badgeName}' to user ${userId}.`);
        return true;
    } catch (err) {
        console.error(`[FATAL] Could not grant badge '${badgeName}' to user ${userId}:`, err);
        return false;
    }
};
