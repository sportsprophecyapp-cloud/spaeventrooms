import { query } from '../database';
import { awardDrawEntry } from './drawService';
import { getLevelFromXp } from '../utils/xpMath';

/**
 * AUTO-RESOLUTION ENGINE
 * Checks pending predictions against finished match scores.
 */
export const resolveSoccerPredictions = async () => {
    console.log('🔮 Resolution Engine: Checking for finished prophecies...');

    try {
        const pending = await query(`
            SELECT p.id, p.user_id, p.prediction_data, m.score_home, m.score_away, m.home_team, m.away_team, u.total_points
            FROM soccer_predictions p
            JOIN soccer_matches m ON p.match_id = m.match_id
            JOIN users u ON p.user_id = u.id
            WHERE p.result = 'pending' AND m.status = 'finished'
        `);

        for (const row of pending.rows) {
            const { id, user_id, prediction_data, score_home, score_away, total_points } = row;
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
                const newTotalPoints = total_points + pointsEarned;
                const { level: newLevel } = getLevelFromXp(newTotalPoints);

                // Update user points and check for level up
                await query(
                    'UPDATE users SET total_points = $1, current_level = $2 WHERE id = $3',
                    [newTotalPoints, newLevel, user_id]
                );
                
                // Award +1 Draw Entry for Skill
                await awardDrawEntry(user_id, 'accuracy', 'soccer');

                // Log the reward
                await query(
                    'INSERT INTO token_transactions (user_id, amount, type, description) VALUES ($1, $2, $3, $4)',
                    [user_id, pointsEarned, 'prediction', `Correct Call: ${row.home_team} vs ${row.away_team}`]
                );
            }
        }
    } catch (err) {
        console.error('❌ Resolution Engine Error:', err);
    }
};
