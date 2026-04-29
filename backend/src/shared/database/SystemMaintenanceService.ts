import { fetchLiveMatches } from '../services/footballApi';
import { resolveSoccerPredictions } from '../services/resolver';
import { query } from '../database';

/**
 * SYSTEM MAINTENANCE SERVICE
 * Purpose: Handles backlog resolution and data integrity checks on startup.
 * Specifically targets "Pending" games that should have been resolved.
 */
export class SystemMaintenanceService {
    static async runMaintenance() {
        console.log('🛠 Starting System Maintenance [Backlog Resolution]...');

        try {
            // 1. Recover Jan 19 Hardcoded (Safety for API gaps)
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

            for (const res of jan19Results) {
                await query(`
                    UPDATE soccer_matches 
                    SET score_home = $1, score_away = $2, status = 'finished', updated_at = NOW()
                    WHERE (home_team LIKE $3 AND away_team LIKE $4)
                    AND start_time > '2026-01-18' AND start_time < '2026-01-21'
                `, [res.score_h, res.score_a, `%${res.home}%`, `%${res.away}%`]);
            }

            // 2. Sync Recent History (Last 72 Hours)
            // We only do this if we find pending games in the window
            const hasRecentPending = await query(`
                SELECT COUNT(*) FROM soccer_predictions p
                JOIN soccer_matches m ON p.match_id = m.match_id
                WHERE p.result = 'pending' AND m.start_time > NOW() - INTERVAL '4 days'
            `);

            if (parseInt(hasRecentPending.rows[0].count) > 0) {
                console.log(`📡 Detected ${hasRecentPending.rows[0].count} recent pending soccer games. Syncing API...`);
                await fetchLiveMatches();
            }

            // NHL Sync Check
            const hasRecentNhlPending = await query(`
                SELECT COUNT(*) FROM nhl_predictions p
                JOIN nhl_matches m ON p.match_id = m.match_id
                WHERE p.result = 'pending' AND m.start_time > NOW() - INTERVAL '4 days'
            `);

            if (parseInt(hasRecentNhlPending.rows[0].count) > 0) {
                console.log(`📡 Detected ${hasRecentNhlPending.rows[0].count} recent pending NHL games. Syncing API...`);
                const { fetchLiveNhlMatches } = require('../services/nhlApi');
                await fetchLiveNhlMatches();
            }

            // 3. Trigger Universal Resolver (Uses 3-hour safety net from v3.5.3)
            await resolveSoccerPredictions();
            
            const { resolveNhlPredictions } = require('../services/nhlResolver');
            await resolveNhlPredictions();

            // 4. Force-resolve anything older than 24 hours that didn't get a score
            // This markers them as "finished" to clear the 'pending' drawer
            const abandonedMatches = await query(`
                UPDATE soccer_matches 
                SET status = 'finished' 
                WHERE status != 'finished' AND start_time < NOW() - INTERVAL '24 hours'
            `);
            if (abandonedMatches.rowCount && abandonedMatches.rowCount > 0) {
                console.log(`🧹 Force-closed ${abandonedMatches.rowCount} abandoned soccer matches.`);
                // Run resolver one last time for these
                await resolveSoccerPredictions();
            }

            const abandonedNhlMatches = await query(`
                UPDATE nhl_matches 
                SET status = 'finished' 
                WHERE status != 'finished' AND start_time < NOW() - INTERVAL '24 hours'
            `);
            if (abandonedNhlMatches.rowCount && abandonedNhlMatches.rowCount > 0) {
                console.log(`🧹 Force-closed ${abandonedNhlMatches.rowCount} abandoned NHL matches.`);
                await resolveNhlPredictions();
            }

            // 5. Catch-all Resolution Safety (v3.8.1)
            // Even if matches are marked correctly, some predictions might be stuck.
            // This marks ANY prediction for a match > 48h old as 'expired' if still pending.
            const catchAll = await query(`
                UPDATE soccer_predictions p
                SET result = 'expired', points_earned = 0
                FROM soccer_matches m
                WHERE p.match_id = m.match_id
                AND p.result = 'pending'
                AND m.start_time < NOW() - INTERVAL '48 hours'
                AND m.status = 'finished'
            `);
            if (catchAll.rowCount && catchAll.rowCount > 0) {
                console.log(`🧼 Catch-all: Expired ${catchAll.rowCount} stuck soccer predictions.`);
            }

            const catchAllNhl = await query(`
                UPDATE nhl_predictions p
                SET result = 'expired', points_earned = 0
                FROM nhl_matches m
                WHERE p.match_id = m.match_id
                AND p.result = 'pending'
                AND m.start_time < NOW() - INTERVAL '48 hours'
                AND m.status = 'finished'
            `);
            if (catchAllNhl.rowCount && catchAllNhl.rowCount > 0) {
                console.log(`🧼 Catch-all: Expired ${catchAllNhl.rowCount} stuck NHL predictions.`);
            }

            console.log('✅ System Maintenance Complete.');
        } catch (error) {
            console.error('❌ System Maintenance Failed:', error);
        }
    }
}
