import { query } from '../database';

export class BadgeService {
    /**
     * Checks and awards milestones for correct predictions.
     */
    static async checkPredictionMilestones(userId: number) {
        try {
            const result = await query(
                'SELECT COUNT(*) as count FROM soccer_predictions WHERE user_id = $1 AND result = \'correct\'',
                [userId]
            );
            const correctCount = parseInt(result.rows[0].count);

            const milestones = [
                { count: 1, key: 'correct_1', tickets: 1, name: 'First Blood', desc: 'First correct prediction', asset: null },
                { count: 5, key: 'correct_5', tickets: 5, name: 'On a Roll', desc: '5 correct predictions', asset: null },
                { count: 25, key: 'correct_25', tickets: 10, name: 'Prophet', desc: '25 correct predictions', asset: null },
                { count: 50, key: 'correct_50', tickets: 25, name: 'Oracle', desc: '50 correct predictions', asset: '/assets/cosmetics/oracle_avatar.png' },
            ];

            for (const m of milestones) {
                if (correctCount >= m.count) {
                    await this.awardAchievement(userId, m.key, m.tickets, m.name, m.desc, 'badge', m.asset);
                }
            }
        } catch (err) {
            console.error('BadgeService: Error checking prediction milestones:', err);
        }
    }

    /**
     * Checks and awards milestones for login streaks.
     */
    static async checkStreakMilestones(userId: number, currentStreak: number) {
        try {
            const milestones = [
                { count: 3, key: 'streak_3', tickets: 1, name: 'Regular', desc: '3 day login streak', asset: null },
                { count: 7, key: 'streak_7', tickets: 3, name: 'Dedicated', desc: '7 day login streak', asset: null },
                { count: 30, key: 'streak_30', tickets: 10, name: 'Loyalist', desc: '30 day login streak', asset: null },
                { count: 90, key: 'streak_90', tickets: 25, name: 'Veteran', desc: '90 day login streak', asset: null },
                { count: 365, key: 'streak_365', tickets: 100, name: 'Legend', desc: '1 year login streak', asset: '/assets/cosmetics/legend_frame.png' },
            ];

            for (const m of milestones) {
                if (currentStreak >= m.count) {
                    await this.awardAchievement(userId, m.key, m.tickets, m.name, m.desc, 'badge', m.asset);
                }
            }
        } catch (err) {
            console.error('BadgeService: Error checking streak milestones:', err);
        }
    }

    /**
     * Internal helper to award an achievement, badge, and tickets.
     */
    private static async awardAchievement(userId: number, key: string, tickets: number, name: string, desc: string, type: string, assetUrl: string | null = null) {
        const { getClient } = require('../database');
        const client = await getClient();
        try {
            await client.query('BEGIN');

            // 1. Check if already awarded (FOR UPDATE to prevent race)
            const check = await client.query(
                'SELECT id FROM user_achievements WHERE user_id = $1 AND achievement_key = $2 FOR UPDATE',
                [userId, key]
            );

            if (check.rows.length > 0) {
                await client.query('ROLLBACK');
                return;
            }

            // 2. Record Achievement
            await client.query(
                'INSERT INTO user_achievements (user_id, achievement_key) VALUES ($1, $2)',
                [userId, key]
            );

            // 3. Ensure Cosmetic/Badge exists
            await client.query(
                `INSERT INTO cosmetics (id, name, type, description, requirement, asset_url, is_achievement_reward) 
                 VALUES ($1, $2, $3, $4, $5, $6, true) 
                 ON CONFLICT (id) DO UPDATE SET name = $2, description = $4, requirement = $5, asset_url = $6, is_achievement_reward = true`,
                [key, name, type, desc, `Requirement: ${desc}`, assetUrl]
            );

            // 4. Give Badge (Cosmetic) to User
            await client.query(
                'INSERT INTO user_cosmetics (user_id, cosmetic_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                [userId, key]
            );

            // 5. Award Tickets & Log
            if (tickets > 0) {
                await client.query(
                    'UPDATE users SET total_tickets = total_tickets + $1 WHERE id = $2',
                    [tickets, userId]
                );

                await client.query(`
                    INSERT INTO token_transactions (user_id, amount, type, description)
                    VALUES ($1, $2, 'achievement_tickets', $3)
                `, [userId, tickets, `Tickets for earning ${name}`]);
            }

            await client.query('COMMIT');
            console.log(`🎖️ Achievement awarded: ${userId} -> ${name}`);

        } catch (err) {
            await client.query('ROLLBACK');
            console.error('BadgeService: awardAchievement failed:', err);
        } finally {
            client.release();
        }
    }
}
