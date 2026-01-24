import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import { query } from '../shared/database';
import { fetchLiveMatches } from '../shared/services/footballApi';
import { resolveSoccerPredictions } from '../shared/services/resolver';

/**
 * UNIVERSAL BACKLOG RECOVERY SCRIPT
 */
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

const universalCleanup = async () => {
    console.log('🌍 STARTING UNIVERSAL BACKLOG CLEANUP (v3.5.5)...');

    try {
        // --- STAGE 0: JAN 19 RECOVERY (Hardcoded) ---
        console.log('\n🔧 STAGE 0: Recovering Jan 19 La Liga results...');
        for (const res of jan19Results) {
            await query(`
                UPDATE soccer_matches 
                SET score_home = $1, score_away = $2, status = 'finished', updated_at = NOW()
                WHERE (home_team LIKE $3 AND away_team LIKE $4)
                AND start_time > '2026-01-18' AND start_time < '2026-01-21'
            `, [res.score_h, res.score_a, `%${res.home}%`, `%${res.away}%`]);
        }
        console.log('  ✅ Jan 19 Match scores injected.');

        // --- STAGE 1: SYNC API (Recent History) ---
        console.log('\n📡 STAGE 1: Fetching current scores from API (last 72 hours)...');
        await fetchLiveMatches().catch(e => console.error('  ⚠️ API Sync failed, moving to Stage 2.'));

        // --- STAGE 2: TIME-BASED RESOLUTION ---
        console.log('\n🔮 STAGE 2: Resolving all matches started > 3 hours ago...');
        // This leverages the new v3.5.3 logic in resolver.ts (which we just updated)
        // but we'll run a local query first to see what we are dealing with.
        const stuckCount = await query(`
            SELECT COUNT(*) FROM soccer_matches 
            WHERE status != 'finished' AND start_time < NOW() - INTERVAL '3 hours'
        `);
        console.log(`📊 Found ${stuckCount.rows[0].count} matches stuck in "Live/Scheduled" but over 3h old.`);

        await resolveSoccerPredictions();

        // --- STAGE 3: ANCIENT SWEEP ---
        console.log('\n🧹 STAGE 3: Expiring ancient ghost predictions (> 14 days)...');
        const ancient = await query(`
            UPDATE soccer_predictions p
            SET result = 'expired'
            FROM soccer_matches m
            WHERE p.match_id = m.match_id
            AND p.result = 'pending'
            AND m.start_time < NOW() - INTERVAL '14 days'
        `);
        console.log(`✅ Expired ${ancient.rowCount || 0} ancient pending predictions.`);

        // --- STAGE 4: MATCH DATA HYGIENE ---
        console.log('\n🧼 STAGE 4: Marking all historic matches as Finished...');
        const matchesResolved = await query(`
            UPDATE soccer_matches 
            SET status = 'finished' 
            WHERE status != 'finished' AND start_time < NOW() - INTERVAL '24 hours'
        `);
        console.log(`✅ Cleaned up status for ${matchesResolved.rowCount || 0} historical matches.`);

        console.log('\n🏆 UNIVERSAL CLEANUP COMPLETE! All user profiles should be refreshed.');

    } catch (err) {
        console.error('❌ Cleanup failed:', err);
    } finally {
        process.exit(0);
    }
};

universalCleanup();
