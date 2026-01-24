import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import { query } from '../shared/database';

const discoverBacklog = async () => {
    console.log('📡 Discovering Stuck Predictions across ALL matches...');

    try {
        const backlog = await query(`
            SELECT 
                m.match_id, 
                m.home_team, 
                m.away_team, 
                m.start_time, 
                m.status,
                COUNT(p.id) as pending_predictions
            FROM soccer_matches m
            JOIN soccer_predictions p ON m.match_id = p.match_id
            WHERE p.result = 'pending'
            GROUP BY m.match_id, m.home_team, m.away_team, m.start_time, m.status
            ORDER BY m.start_time ASC
        `);

        if (backlog.rows.length === 0) {
            console.log('✅ No pending predictions found in the database.');
            return;
        }

        console.log(`📊 Found ${backlog.rows.length} matches with pending predictions:`);
        backlog.rows.forEach(row => {
            console.log(`- ID: ${row.match_id} | ${row.home_team} vs ${row.away_team} | Start: ${row.start_time} | Count: ${row.pending_predictions}`);
        });

    } catch (err) {
        console.error('❌ Discovery failed:', err);
    } finally {
        process.exit(0);
    }
};

discoverBacklog();
