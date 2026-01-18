import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import { query } from '../shared/database';

const analyzePending = async () => {
    console.log('🕵️‍♂️ Analyzing ALL PENDING predictions...');

    try {
        const res = await query(`
            SELECT 
                p.id as prediction_id,
                p.match_id,
                p.created_at as pred_created,
                m.home_team,
                m.away_team,
                m.start_time,
                m.status as match_status,
                m.score_home,
                m.score_away,
                m.league
            FROM soccer_predictions p
            JOIN soccer_matches m ON p.match_id = m.match_id
            WHERE p.result = 'pending'
            ORDER BY m.start_time ASC
        `);

        console.log(`\nFound ${res.rowCount} PENDING predictions.`);

        if (res.rowCount && res.rowCount > 0) {
            res.rows.forEach(row => {
                console.log(` - [Pred:${row.prediction_id}] ${row.home_team} vs ${row.away_team} (${row.league})`);
                console.log(`   Start: ${row.start_time} | Status: ${row.match_status} | Score: ${row.score_home}-${row.score_away}`);
            });
        }

        // Count matches by status that have pending predictions
        const statusCounts = await query(`
            SELECT m.status, COUNT(*) as count
            FROM soccer_predictions p
            JOIN soccer_matches m ON p.match_id = m.match_id
            WHERE p.result = 'pending'
            GROUP BY m.status
        `);
        console.log('\nMatch Status Summary for Pending Predictions:');
        statusCounts.rows.forEach(row => console.log(` - ${row.status}: ${row.count}`));

    } catch (err) {
        console.error('Error querying data:', err);
    } finally {
        process.exit(0);
    }
};

analyzePending();
