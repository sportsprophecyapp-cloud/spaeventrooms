import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import { query } from '../shared/database';
import { resolveSoccerPredictions } from '../shared/services/resolver';

const jan19Results = [
    { home: 'Girona', away: 'Getafe', score_h: 1, score_a: 1 },
    { home: 'Alavés', away: 'Real Betis', score_h: 0, score_a: 0 },
    { home: 'Real Sociedad', away: 'Celta Vigo', score_h: 1, score_a: 0 },
    { home: 'Barcelona', away: 'Oviedo', score_h: 2, score_a: 0 },
    { home: 'Atlético Madrid', away: 'Mallorca', score_h: 1, score_a: 0 },
    { home: 'Villarreal', away: 'Real Madrid', score_h: 2, score_a: 3 },
    { home: 'Sevilla', away: 'Athletic Bilbao', score_h: 1, score_a: 2 },
    { home: 'Valencia', away: 'Espanyol', score_h: 1, score_a: 0 },
    { home: 'Rayo Vallecano', away: 'CA Osasuna', score_h: 0, score_a: 1 }
];

const forceResolveJan19 = async () => {
    console.log('🚀 FORCE RESOLVE: Jan 19 La Liga Matchday...');

    try {
        for (const res of jan19Results) {
            console.log(`- Updating: ${res.home} vs ${res.away} (${res.score_h}-${res.score_a})...`);

            // Update the match in DB if it matches teams and date range
            const matchUpdate = await query(`
                UPDATE soccer_matches 
                SET score_home = $1, score_away = $2, status = 'finished', updated_at = NOW()
                WHERE (home_team LIKE $3 AND away_team LIKE $4)
                AND start_time > '2026-01-18' AND start_time < '2026-01-21'
                RETURNING match_id
            `, [res.score_h, res.score_a, `%${res.home}%`, `%${res.away}%`]);

            if (matchUpdate.rowCount && matchUpdate.rowCount > 0) {
                console.log(`  ✅ Match ${matchUpdate.rows[0].match_id} updated.`);
            } else {
                console.log(`  ⚠️ Match not found in DB.`);
            }
        }

        console.log('\n🔮 Running Resolution Engine to award rewards...');
        await resolveSoccerPredictions();

        console.log('\n🧹 Final Sweep: Marking matching started > 7 days ago as expired...');
        const expired = await query(`
            UPDATE soccer_predictions p
            SET result = 'expired'
            FROM soccer_matches m
            WHERE p.match_id = m.match_id
            AND p.result = 'pending'
            AND m.start_time < NOW() - INTERVAL '7 days'
        `);
        console.log(`✅ Expired ${expired.rowCount || 0} ancient predictions.`);

        // NEW: Force close any old matches that never marked themselves finished
        const matchesClosed = await query(`
            UPDATE soccer_matches 
            SET status = 'finished' 
            WHERE status != 'finished' 
            AND start_time < NOW() - INTERVAL '48 hours'
        `);
        console.log(`✅ Force-closed ${matchesClosed.rowCount || 0} stuck matches from history.`);

        console.log('\n🏁 Jan 19 Resolution Complete!');

    } catch (err) {
        console.error('❌ Jan 19 Resolution failed:', err);
    } finally {
        process.exit(0);
    }
};

forceResolveJan19();
