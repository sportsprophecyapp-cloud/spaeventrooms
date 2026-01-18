import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import { query } from '../shared/database';

const cleanupOldGames = async () => {
    console.log('🧹 Starting cleanup of old pending games...');

    // We target games that should have finished by now (e.g., started more than 6 hours ago)
    // and are still not in 'finished' status.
    // The user specifically mentioned games as far back as Jan 5th.

    try {
        // 1. Identify matches to be removed
        const findMatches = await query(`
            SELECT match_id, home_team, away_team, start_time, status 
            FROM soccer_matches 
            WHERE start_time < NOW() - INTERVAL '6 hours'
            AND status != 'finished'
        `);

        console.log(`📊 Found ${findMatches.rowCount} old matches that are NOT finished.`);

        if (findMatches.rowCount && findMatches.rowCount > 0) {
            const matchIds = findMatches.rows.map(r => r.match_id);

            // 2. Delete associated predictions first (Foreign Key constraint)
            console.log(`🗑️ Deleting predictions for ${findMatches.rowCount} old matches...`);
            const delPredictions = await query(`
                DELETE FROM soccer_predictions 
                WHERE match_id = ANY($1)
            `, [matchIds]);
            console.log(`✅ Deleted ${delPredictions.rowCount} predictions.`);

            // 3. Delete the matches
            console.log(`🗑️ Deleting old matches...`);
            const delMatches = await query(`
                DELETE FROM soccer_matches 
                WHERE match_id = ANY($1)
            `, [matchIds]);
            console.log(`✅ Deleted ${delMatches.rowCount} matches.`);
        } else {
            console.log('✅ No old pending matches found to cleanup.');
        }

    } catch (err) {
        console.error('❌ Cleanup failed:', err);
    } finally {
        process.exit(0);
    }
};

cleanupOldGames();
