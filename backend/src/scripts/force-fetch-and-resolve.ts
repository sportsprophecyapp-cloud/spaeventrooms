import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import { query } from '../shared/database';
import { fetchLiveMatches } from '../shared/services/footballApi';
import { resolveSoccerPredictions } from '../shared/services/resolver';

/**
 * UNIVERSAL BACKLOG RECOVERY SCRIPT
 * 1. Syncs latest real scores from API (covers Jan 19 - Jan 24)
 * 2. Force-resolves ANY match started > 3 hours ago regardless of status
 * 3. Sweeps Ancient Pending prophecies (> 14 days) into "expired"
 */
const universalCleanup = async () => {
    console.log('🌍 STARTING UNIVERSAL BACKLOG CLEANUP...');

    try {
        // --- STAGE 1: SYNC API (Last 7 Days) ---
        console.log('\n📡 STAGE 1: Fetching real scores for the last 7 days...');
        await fetchLiveMatches(); // Defaults to 7 days window

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
