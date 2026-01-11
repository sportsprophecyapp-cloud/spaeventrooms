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
            SELECT p.id, p.user_id, p.prediction_data, m.score_home, m.score_away, m.home_team, m.away_team, u.total_points, u.total_tickets
            FROM soccer_predictions p
            JOIN soccer_matches m ON p.match_id = m.match_id
            JOIN users u ON p.user_id = u.id
            WHERE p.result = 'pending' AND m.status = 'finished'
        `);

        for (const row of pending.rows) {
            const { id, user_id, prediction_data, score_home, score_away, total_points, total_tickets } = row;
            const pick = prediction_data.pick;

            let actualWinner: string = 'draw';
            if (score_home > score_away) actualWinner = row.home_team;
            else if (score_away > score_home) actualWinner = row.away_team;

            const isCorrect = pick === actualWinner;
            const pointsEarned = isCorrect ? 100 : 0;
            const ticketsEarned = isCorrect ? 1 : 0; // NEW: +1 ticket for a correct call
            const resultStatus = isCorrect ? 'correct' : 'incorrect';

            if (isCorrect) {
                // NEW: Use unified reward engine
                const { gamificationService } = require('../gamification/GamificationService');
                await gamificationService.awardReward(user_id, {
                    tokens: 10,
                    tickets: 1,
                    xp: 100,
                    type: 'prediction',
                    description: `Correct Call: ${row.home_team} vs ${row.away_team}`
                });

                // Log the entry for future prize draws
                await awardDrawEntry(user_id, 'accuracy', 'soccer');

                // NEW: Trigger Milestone check
                const { BadgeService } = require('../gamification/BadgeService');
                await BadgeService.checkPredictionMilestones(user_id);

                await query(
                    'UPDATE soccer_predictions SET result = $1, points_earned = $2 WHERE id = $3',
                    [resultStatus, pointsEarned, id]
                );
            } else {
                await query(
                    'UPDATE soccer_predictions SET result = $1, points_earned = $2 WHERE id = $3',
                    [resultStatus, pointsEarned, id]
                );
            }
        }
    } catch (err) {
        console.error('❌ Resolution Engine Error:', err);
    }
};
