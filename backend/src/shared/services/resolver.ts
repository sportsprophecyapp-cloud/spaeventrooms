import { query } from '../database';

/**
 * AUTO-RESOLUTION ENGINE
 * Checks pending predictions against finished match scores.
 */
export const resolveSoccerPredictions = async () => {
    console.log('🔮 Resolution Engine: Checking for finished prophecies...');

    try {
        // 1. Fetch pending predictions linked to finished matches
        const pending = await query(`
            SELECT p.id, p.user_id, p.prediction_data, m.score_home, m.score_away, m.home_team, m.away_team
            FROM soccer_predictions p
            JOIN soccer_matches m ON p.match_id = m.match_id
            WHERE p.result = 'pending' AND m.status = 'finished'
        `);

        console.log(`🔍 Found ${pending.rows.length} prophecies to resolve.`);

        for (const row of pending.rows) {
            const { id, user_id, prediction_data, score_home, score_away } = row;
            const pick = prediction_data.pick; // 'home', 'draw', or 'away'

            // Determine actual winner
            let actual: 'home' | 'draw' | 'away' = 'draw';
            if (score_home > score_away) actual = 'home';
            else if (score_away > score_home) actual = 'away';

            const isCorrect = pick === actual;
            const pointsEarned = isCorrect ? 100 : 0;
            const resultStatus = isCorrect ? 'correct' : 'incorrect';

            // 2. Update prediction record
            await query(
                'UPDATE soccer_predictions SET result = $1, points_earned = $2 WHERE id = $3',
                [resultStatus, pointsEarned, id]
            );

            if (isCorrect) {
                // 3. Award points and XP to User
                await query(
                    'UPDATE users SET total_points = total_points + $1 WHERE id = $2',
                    [pointsEarned, user_id]
                );
                
                // 4. Log the reward transaction
                await query(
                    'INSERT INTO token_transactions (user_id, amount, type, description) VALUES ($1, $2, $3, $4)',
                    [user_id, pointsEarned, 'prediction', `Correct Prophecy: ${row.home_team} vs ${row.away_team}`]
                );
            }
        }

        if (pending.rows.length > 0) {
            console.log(`✅ Successfully resolved ${pending.rows.length} prophecies.`);
        }

    } catch (err) {
        console.error('❌ Resolution Engine Error:', err);
    }
};
