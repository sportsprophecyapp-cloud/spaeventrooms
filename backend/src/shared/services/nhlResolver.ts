import { query } from '../database';
import { awardDrawEntry } from './drawService';

export const resolveNhlPredictions = async () => {
    console.log('🔮 NHL Resolution Engine: Checking for finished prophecies...');

    try {
        const pending = await query(`
            SELECT p.id, p.user_id, p.prediction_data, m.score_home, m.score_away, m.home_team, m.away_team, m.match_id, m.status, u.total_points, u.total_tickets
            FROM nhl_predictions p
            JOIN nhl_matches m ON p.match_id = m.match_id
            JOIN users u ON p.user_id = u.id
            WHERE p.result = 'pending' 
            AND (m.status = 'finished' OR m.start_time < NOW() - INTERVAL '3 hours')
        `);

        for (const row of pending.rows) {
            const { id, user_id, prediction_data, score_home, score_away, match_id } = row;
            const pick = prediction_data.pick;

            if (row.status !== 'finished') {
                await query('UPDATE nhl_matches SET status = \'finished\', updated_at = NOW() WHERE match_id = $1', [match_id]);
            }

            let actualWinner: string = 'draw';
            if (score_home > score_away) actualWinner = row.home_team;
            else if (score_away > score_home) actualWinner = row.away_team;

            const normalize = (s: string) => s.trim().toLowerCase();
            const isCorrect = normalize(pick) === normalize(actualWinner);

            console.log(`🔍 Resolving NHL Prediction ${id}: Pick [${pick}] vs Winner [${actualWinner}] -> ${isCorrect ? '✅' : '❌'}`);

            const pointsEarned = isCorrect ? 100 : 0;
            const resultStatus = isCorrect ? 'correct' : 'incorrect';

            if (isCorrect) {
                const { gamificationService } = require('../gamification/GamificationService');
                await gamificationService.awardReward(user_id, {
                    tokens: 10,
                    tickets: 1,
                    xp: 100,
                    type: 'prediction',
                    description: `Correct Call: ${row.home_team} vs ${row.away_team}`
                });

                await awardDrawEntry(user_id, 'accuracy', 'nhl');

                const { BadgeService } = require('../gamification/BadgeService');
                await BadgeService.checkPredictionMilestones(user_id);

                const { socketService } = require('../socket/SocketService');
                socketService.emitToRoom(`user:${user_id}`, 'private_message', {
                    from: 'Arena Reward',
                    message: `🎉 Correct Call! You earned 10 Tokens & 1 Ticket for ${row.home_team} vs ${row.away_team}`,
                    type: 'reward'
                });
            }
            
            await query(
                'UPDATE nhl_predictions SET result = $1, points_earned = $2 WHERE id = $3',
                [resultStatus, pointsEarned, id]
            );
        }

        const staleCount = await query(`
            UPDATE nhl_predictions p
            SET result = 'expired', points_earned = 0
            FROM nhl_matches m
            WHERE p.match_id = m.match_id
            AND p.result = 'pending'
            AND m.start_time < NOW() - INTERVAL '8 days'
        `);

        if (staleCount.rowCount && staleCount.rowCount > 0) {
            console.log(`NHL Stale Cleanup: Marked ${staleCount.rowCount} ghost predictions as expired.`);
        }

    } catch (err) {
        console.error('❌ NHL Resolution Engine Error:', err);
    }
};
