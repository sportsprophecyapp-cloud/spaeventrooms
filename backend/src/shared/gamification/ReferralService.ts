import { query } from '../database';

export class ReferralService {
    /**
     * Processes a referral: awards tokens to the referrer and links the accounts.
     */
    static async processReferral(refereeId: number, referralCode: string) {
        try {
            // 1. Find the referrer
            const referrerResult = await query(
                'SELECT id FROM users WHERE referral_code = $1',
                [referralCode.toUpperCase()]
            );

            if (referrerResult.rows.length === 0) return;

            const referrerId = referrerResult.rows[0].id;

            // 2. Link the accounts
            await query(
                'UPDATE users SET referred_by_id = $1 WHERE id = $2',
                [referrerId, refereeId]
            );

            // 3. Award reward to referrer (50 Tokens as requested)
            await query(
                'UPDATE users SET token_balance = token_balance + 50 WHERE id = $1',
                [referrerId]
            );

            // 4. Log the transaction
            await query(
                'INSERT INTO token_transactions (user_id, amount, type, description) VALUES ($1, 50, \'referral\', $2)',
                [referrerId, `Referral bonus for User ID ${refereeId}`]
            );

            console.log(`✅ Referral processed: User ${referrerId} earned 50 tokens from User ${refereeId}`);

            // 5. Check for tiered referral milestones (1, 5, 25, 50)
            const countResult = await query('SELECT COUNT(*) as count FROM users WHERE referred_by_id = $1', [referrerId]);
            const count = parseInt(countResult.rows[0].count);

            if (count === 1) {
                // First referral bonus
                await query('UPDATE users SET token_balance = token_balance + 25 WHERE id = $1', [referrerId]);
            } else if (count === 5) {
                // Milestone 5 bonus
                await query('UPDATE users SET token_balance = token_balance + 100 WHERE id = $1', [referrerId]);
            } else if (count === 25) {
                // Milestone 25 bonus
                await query('UPDATE users SET token_balance = token_balance + 500 WHERE id = $1', [referrerId]);
            } else if (count === 50) {
                // Milestone 50 - Award Elite Avatar
                const eliteAvatar = await query("SELECT id FROM cosmetics WHERE name = 'Elite Avatar' LIMIT 1");
                if (eliteAvatar.rows.length > 0) {
                    await query('INSERT INTO user_cosmetics (user_id, cosmetic_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [referrerId, eliteAvatar.rows[0].id]);
                }
            }

        } catch (err) {
            console.error('❌ Referral processing failed:', err);
        }
    }
}
