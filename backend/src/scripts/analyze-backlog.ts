import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import { query } from '../shared/database';

const analyzeBacklog = async () => {
    console.log('🔍 Analyzing Prediction Backlog...');

    try {
        // 1. Find matches started > 3 hours ago but not 'finished'
        const stuckMatches = await query(`
            SELECT match_id, home_team, away_team, status, start_time, updated_at
            FROM soccer_matches 
            WHERE status != 'finished' 
            AND start_time < NOW() - INTERVAL '3 hours'
            ORDER BY start_time DESC
        `);

        console.log(`📊 Stuck Matches (Started > 3h ago, status != finished): ${stuckMatches.rowCount}`);
        stuckMatches.rows.forEach(m => {
            console.log(`  - [${m.status}] ${m.home_team} vs ${m.away_team} (Started: ${m.start_time})`);
        });

        // 2. Find pending predictions for those matches
        const stuckPredictions = await query(`
            SELECT COUNT(*) as count
            FROM soccer_predictions p
            JOIN soccer_matches m ON p.match_id = m.match_id
            WHERE p.result = 'pending'
            AND m.status != 'finished'
            AND m.start_time < NOW() - INTERVAL '3 hours'
        `);

        console.log(`⏳ Pending Predictions for Stuck Matches: ${stuckPredictions.rows[0].count}`);

        // 3. Find pending predictions for matches that ARE finished but still pending
        const missingResolution = await query(`
            SELECT COUNT(*) as count
            FROM soccer_predictions p
            JOIN soccer_matches m ON p.match_id = m.match_id
            WHERE p.result = 'pending'
            AND m.status = 'finished'
        `);

        console.log(`🔮 Pending Predictions for Finished Matches: ${missingResolution.rows[0].count}`);

    } catch (err) {
        console.error('❌ Analysis failed:', err);
    } finally {
        process.exit(0);
    }
};

analyzeBacklog();
