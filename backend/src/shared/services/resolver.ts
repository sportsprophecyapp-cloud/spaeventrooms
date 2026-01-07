import { query } from '../database';
import { awardDrawEntry } from './drawService';

/**
 * AUTO-RESOLUTION ENGINE
 * Checks pending predictions against finished match scores.
 */
export const resolveSoccerPredictions = async () => {
    console.log('🔮 Resolution Engine: Checking for finished prophecies...');

    try {
        const pending = await query(`
            SELECT p.id, p.user_id, p.prediction_data, m.score_home, m.score_away, m.home_team, m.away_team
            FROM soccer_predictions p
            JOIN soccer_matches m ON p.match_id = m.match_id
            WHERE p.result = 'pending' AND m.status = 'finished'
        `);

        for (const row of pending.rows) {
            const { id, user_id, prediction_data, score_home, score_away } = row;
            const pick = prediction_data.pick;

            let actual: 'home' | 'draw' | 'away' = 'draw';
            if (score_home > score_away) actual = 'home';
            else if (score_away > score_home) actual = 'away';

            const isCorrect = pick === actual;
            const pointsEarned = isCorrect ? 100 : 0;
            const resultStatus = isCorrect ? 'correct' : 'incorrect';

            await query(
                'UPDATE soccer_predictions SET result = $1, points_earned = $2 WHERE id = $3',
                [resultStatus, pointsEarned, id]
            );

            if (isCorrect) {
                // 1. Award Points/XP
                await query(
                    'UPDATE users SET total_points = total_points + $1 WHERE id = $2',
                    [pointsEarned, user_id]
                );
                
                // 2. NEW: Award +1 Draw Entry for Skill
                await awardDrawEntry(user_id, 'accuracy', 'soccer');

                // 3. Log the reward
                await query(
                    'INSERT INTO token_transactions (user_id, amount, type, description) VALUES ($1, $2, $3, $4)',
                    [user_id, pointsEarned, 'prediction', `Correct Prophecy: ${row.home_team} vs ${row.away_team}`]
                );
            }
        }
    } catch (err) {
        console.error('❌ Resolution Engine Error:', err);
    }
};
