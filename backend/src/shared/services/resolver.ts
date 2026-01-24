import { query } from '../database';
import { awardDrawEntry } from './drawService';
// import { getLevelFromXp } from '../utils/xpMath'; // Not used in this file but was there

/**
 * AUTO-RESOLUTION ENGINE
 * Checks pending predictions against finished match scores.
 */
export const resolveSoccerPredictions = async () => {
    console.log('🔮 Resolution Engine: Checking for finished prophecies...');

    try {
        const pending = await query(`
            SELECT p.id, p.user_id, p.prediction_data, m.score_home, m.score_away, m.home_team, m.away_team, m.match_id, m.status, u.total_points, u.total_tickets
            FROM soccer_predictions p
            JOIN soccer_matches m ON p.match_id = m.match_id
            JOIN users u ON p.user_id = u.id
            WHERE p.result = 'pending' 
            AND (m.status = 'finished' OR m.start_time < NOW() - INTERVAL '3 hours')
        `);

        for (const row of pending.rows) {
            const { id, user_id, prediction_data, score_home, score_away, match_id } = row;
            const pick = prediction_data.pick;

            // SAFETY: If we are resolving this but DB says it's not finished, mark it finished now
            if (row.status !== 'finished') {
                await query('UPDATE soccer_matches SET status = \'finished\', updated_at = NOW() WHERE match_id = $1', [match_id]);
            }

            let actualWinner: string = 'draw';
            if (score_home > score_away) actualWinner = row.home_team;
            else if (score_away > score_home) actualWinner = row.away_team;

            // Robust comparison: normalize strings
            const normalize = (s: string) => s.trim().toLowerCase();
            const isCorrect = normalize(pick) === normalize(actualWinner);

            console.log(`🔍 Resolving Prediction ${id}: Pick [${pick}] vs Winner [${actualWinner}] -> ${isCorrect ? '✅' : '❌'}`);

            const pointsEarned = isCorrect ? 100 : 0;
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

                const { BadgeService } = require('../gamification/BadgeService');
                await BadgeService.checkPredictionMilestones(user_id);

                // NEW: Notify Reward Real-time (v3.5)
                const { socketService } = require('../socket/SocketService');
                socketService.emitToRoom(`user:${user_id}`, 'private_message', {
                    from: 'Arena Reward',
                    message: `🎉 Correct Call! You earned 10 Tokens & 1 Ticket for ${row.home_team} vs ${row.away_team}`,
                    type: 'reward'
                });

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

        // --- STALE CLEANUP PASS ---
        // Identify predictions for matches that started > 8 days ago and are STILL pending.
        // These are "Zombie" entries where the API likely failed to report 'finished' or we missed it.
        const staleCount = await query(`
            UPDATE soccer_predictions p
            SET result = 'expired', points_earned = 0
            FROM soccer_matches m
            WHERE p.match_id = m.match_id
            AND p.result = 'pending'
            AND m.start_time < NOW() - INTERVAL '8 days'
        `);

        if (staleCount.rowCount && staleCount.rowCount > 0) {
            console.log(`Stale Cleanup: Marked ${staleCount.rowCount} ghost predictions as expired.`);
        }

    } catch (err) {
        console.error('❌ Resolution Engine Error:', err);
    }
};
