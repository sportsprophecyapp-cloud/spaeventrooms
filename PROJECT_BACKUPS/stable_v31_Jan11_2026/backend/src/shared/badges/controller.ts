import { Response } from 'express';
import { query as dbQuery } from '../database';
import { AuthRequest } from '../auth/middleware';

export const getMyBadges = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const result = await dbQuery(
            `SELECT c.id, c.name, c.description, c.requirement, c.asset_url, uc.acquired_at, uc.is_equipped
             FROM cosmetics c
             JOIN user_cosmetics uc ON c.id = uc.cosmetic_id
             WHERE uc.user_id = $1 AND c.type = 'badge'`,
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching user badges:', error);
        res.status(500).json({ error: 'Failed to fetch badges' });
    }
};

export const equipBadge = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { badgeId } = req.body;

        // 1. Unequip all badges
        await dbQuery('UPDATE user_cosmetics SET is_equipped = false WHERE user_id = $1', [userId]);

        // 2. Equip new badge
        await dbQuery(
            'UPDATE user_cosmetics SET is_equipped = true WHERE user_id = $1 AND cosmetic_id = $2',
            [userId, badgeId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error equipping badge:', error);
        res.status(500).json({ error: 'Failed to equip badge' });
    }
};
