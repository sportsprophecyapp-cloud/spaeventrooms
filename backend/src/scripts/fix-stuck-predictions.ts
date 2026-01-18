import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import { query } from '../shared/database';
import { resolveSoccerPredictions } from '../shared/services/resolver';

const forceCleanup = async () => {
    console.log('🧹 EMERGENCY CLEANUP: Fixing stuck predictions...');

    try {
        // 1. First, try a normal resolution pass in case any matches ARE finished in DB
        await resolveSoccerPredictions();

        // 2. Identify matches from Jan 17th and earlier that are still "pending" in UI
        // We look for everything older than Jan 18th (current real time is Jan 18th)
        const cutoff = '2026-01-18T00:00:00Z';

        console.log(`📡 Targeting predictions for matches starting before ${cutoff}...`);

        const res = await query(`
            UPDATE soccer_predictions p
            SET result = 'expired', points_earned = 0
            FROM soccer_matches m
            WHERE p.match_id = m.match_id
            AND p.result = 'pending'
            AND m.start_time < $1
            RETURNING p.id
        `, [cutoff]);

        console.log(`✅ Success: Forcefully expired ${res.rowCount || 0} stuck predictions.`);

        // 3. Mark the matches themselves as finished if they were in the past to prevent UI clutter
        const matchRes = await query(`
            UPDATE soccer_matches 
            SET status = 'finished'
            WHERE status != 'finished' 
            AND start_time < $1
        `, [cutoff]);
        console.log(`✅ Success: Marked ${matchRes.rowCount || 0} past matches as 'finished' in DB.`);

        console.log('\n🏁 Cleanup complete. These games will no longer appear as PENDING.');

    } catch (err) {
        console.error('❌ Cleanup failed:', err);
    } finally {
        process.exit(0);
    }
};

forceCleanup();
