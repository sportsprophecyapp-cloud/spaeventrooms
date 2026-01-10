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

            // TODO: In the future, check for tiered referral milestones (1, 5, 25, 50)

        } catch (err) {
            console.error('❌ Referral processing failed:', err);
        }
    }
}
