import { query } from '../database';

export class ReferralService {
    /**
     * Processes a referral: awards tokens to the referrer and links the accounts.
     */
    static async processReferral(refereeId: number, referralCode: string) {
        const { getClient } = require('../database');
        const client = await getClient();
        try {
            await client.query('BEGIN');

            // 1. Find the referrer
            const referrerResult = await client.query(
                'SELECT id FROM users WHERE referral_code = $1 FOR UPDATE',
                [referralCode.toUpperCase()]
            );

            if (referrerResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return;
            }

            const referrerId = referrerResult.rows[0].id;

            // 2. Prevent self-referral
            if (referrerId === refereeId) {
                await client.query('ROLLBACK');
                return;
            }

            // 3. Check if referee already has a referrer
            const refereeResult = await client.query('SELECT referred_by_id FROM users WHERE id = $1 FOR UPDATE', [refereeId]);
            if (refereeResult.rows[0].referred_by_id) {
                await client.query('ROLLBACK');
                return;
            }

            // 4. Link the accounts
            await client.query(
                'UPDATE users SET referred_by_id = $1 WHERE id = $2',
                [referrerId, refereeId]
            );

            // 5. Award reward to referrer (50 Tokens)
            await client.query('UPDATE users SET token_balance = token_balance + 50 WHERE id = $1', [referrerId]);
            await client.query(
                'INSERT INTO token_transactions (user_id, amount, type, description) VALUES ($1, 50, \'referral\', $2)',
                [referrerId, `Referral bonus for User ID ${refereeId}`]
            );

            // 6. Award reward to referee (25 Token Welcome Bonus)
            await client.query('UPDATE users SET token_balance = token_balance + 25 WHERE id = $1', [refereeId]);
            await client.query(
                'INSERT INTO token_transactions (user_id, amount, type, description) VALUES ($1, 25, \'referral_welcome\', $2)',
                [refereeId, `Welcome bonus for using referral code ${referralCode}`]
            );

            // 7. Check for tiered referral milestones (1, 10, 25, 50)
            const countResult = await client.query('SELECT COUNT(*) as count FROM users WHERE referred_by_id = $1', [referrerId]);
            const count = parseInt(countResult.rows[0].count);

            let bonus = 0;
            let desc = '';
            let cosmetic = null;

            if (count === 1) {
                bonus = 100;
                desc = 'Arena Recruiter';
                cosmetic = {
                    id: 'referral_1',
                    name: 'Arena Recruiter',
                    type: 'badge',
                    description: 'Your first step into the Social Arena.',
                    asset: '/assets/cosmetics/recruiter_badge.png'
                };
            } else if (count === 10) {
                bonus = 500;
                desc = 'Social Guardian';
                cosmetic = {
                    id: 'referral_10',
                    name: 'Social Guardian',
                    type: 'frame',
                    description: 'A frame for those who protect the community.',
                    asset: '/assets/cosmetics/champion_frame.png'
                };
            } else if (count === 25) {
                bonus = 1000;
                desc = 'Arena Influencer';
                cosmetic = {
                    id: 'referral_25',
                    name: 'Arena Influencer',
                    type: 'avatar',
                    description: 'Your voice echoes through the Arena.',
                    asset: '/assets/cosmetics/oracle_avatar.png'
                };
            } else if (count === 50) {
                bonus = 2500;
                desc = 'Network Master';
                cosmetic = {
                    id: 'referral_50',
                    name: 'Network Master',
                    type: 'avatar',
                    description: 'Master of the Social Arena.',
                    asset: '/assets/cosmetics/referrer_master.png'
                };
                await client.query('UPDATE users SET can_upload_custom = TRUE WHERE id = $1', [referrerId]);
            }

            if (cosmetic) {
                await client.query(
                    `INSERT INTO cosmetics (id, name, type, description, requirement, asset_url, is_achievement_reward) 
                     VALUES ($1, $2, $3, $4, $5, $6, true) 
                     ON CONFLICT (id) DO UPDATE SET asset_url = $6, is_achievement_reward = true`,
                    [cosmetic.id, cosmetic.name, cosmetic.type, cosmetic.description, `Unlock with ${count} referrals`, cosmetic.asset]
                );

                await client.query(
                    'INSERT INTO user_cosmetics (user_id, cosmetic_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                    [referrerId, cosmetic.id]
                );
                console.log(`👑 Awarded ${cosmetic.name} to User ${referrerId}`);
            }

            if (bonus > 0) {
                await client.query('UPDATE users SET token_balance = token_balance + $1 WHERE id = $2', [bonus, referrerId]);
                await client.query(
                    'INSERT INTO token_transactions (user_id, amount, type, description) VALUES ($1, $2, \'referral_milestone\', $3)',
                    [referrerId, bonus, desc]
                );
            }

            await client.query('COMMIT');
            console.log(`✅ Referral fully processed: Referrer ${referrerId}, Referee ${refereeId}`);

        } catch (err) {
            await client.query('ROLLBACK');
            console.error('❌ Referral processing failed:', err);
        } finally {
            client.release();
        }
    }
}
