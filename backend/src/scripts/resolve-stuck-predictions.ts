import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import { fetchLiveMatches } from '../shared/services/footballApi';
import { resolveSoccerPredictions } from '../shared/services/resolver';
import { query } from '../shared/database';

/**
 * ONE-TIME CLEANUP SCRIPT
 * Resolves stuck pending predictions by forcing a full API sync
 * and running the resolver on all pending predictions.
 */
const cleanupStuckPredictions = async () => {
    console.log('🧹 CLEANUP: Resolving stuck pending predictions...');

    try {
        // 1. Check how many pending predictions we have
        const pendingCount = await query(`
            SELECT COUNT(*) as count 
            FROM soccer_predictions 
            WHERE result = 'pending'
        `);
        console.log(`📊 Found ${pendingCount.rows[0].count} pending predictions`);

        // 2. Force fetch ALL leagues to update match statuses
        console.log('📡 Fetching latest match data from API (7 days back)...');
        await fetchLiveMatches();

        // 3. Run resolver to process all pending predictions
        console.log('🔮 Running resolution engine...');
        await resolveSoccerPredictions();

        // 4. Check how many are still pending
        const stillPending = await query(`
            SELECT COUNT(*) as count 
            FROM soccer_predictions 
            WHERE result = 'pending'
        `);

        const resolved = parseInt(pendingCount.rows[0].count) - parseInt(stillPending.rows[0].count);
        console.log(`✅ Resolved ${resolved} predictions`);
        console.log(`⏳ ${stillPending.rows[0].count} predictions still pending (matches not finished yet)`);

        // 5. Show some details about remaining pending predictions
        if (parseInt(stillPending.rows[0].count) > 0) {
            const details = await query(`
                SELECT 
                    p.id,
                    m.home_team,
                    m.away_team,
                    m.start_time,
                    m.status,
                    p.created_at
                FROM soccer_predictions p
                JOIN soccer_matches m ON p.match_id = m.match_id
                WHERE p.result = 'pending'
                ORDER BY m.start_time DESC
                LIMIT 10
            `);

            console.log('\n📋 Sample of remaining pending predictions:');
            details.rows.forEach(row => {
                console.log(`  - ${row.home_team} vs ${row.away_team} | Status: ${row.status} | Match: ${row.start_time}`);
            });
        }

        console.log('\n🏁 Cleanup complete!');
    } catch (err) {
        console.error('❌ Cleanup failed:', err);
    } finally {
        process.exit(0);
    }
};

cleanupStuckPredictions();
