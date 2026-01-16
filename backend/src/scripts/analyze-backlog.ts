import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import { query } from '../shared/database';
import { fetchLiveMatches } from '../shared/services/footballApi';

const analyzeBacklog = async () => {
    console.log('🕵️‍♂️ Analyzing Pending Predictions Backlog...');

    // 1. Get all pending predictions joined with matches
    const res = await query(`
        SELECT 
            p.id, 
            p.user_id, 
            p.created_at, 
            m.home_team, 
            m.away_team, 
            m.league, 
            m.start_time, 
            m.status 
        FROM soccer_predictions p
        JOIN soccer_matches m ON p.match_id = m.match_id
        WHERE p.result = 'pending'
        ORDER BY m.start_time ASC
    `);

    console.log(`\nFound ${res.rowCount} PENDING predictions.`);

    if (res.rowCount === 0) {
        console.log('✅ No backlog found.');
        return;
    }

    // Group by Date for summary
    const byDate: Record<string, number> = {};
    const leagues: Set<string> = new Set();

    let oldest = new Date();
    let newest = new Date(0);

    for (const row of res.rows) {
        const date = new Date(row.start_time).toDateString();
        byDate[date] = (byDate[date] || 0) + 1;
        leagues.add(row.league);

        const d = new Date(row.start_time);
        if (d < oldest) oldest = d;
        if (d > newest) newest = d;
    }

    console.log('\n📅 Breakdown by Match Date:');
    Object.entries(byDate).forEach(([date, count]) => console.log(`   - ${date}: ${count} predictions`));

    console.log(`\nOldest Match: ${oldest.toISOString()}`);
    console.log(`Newest Match: ${newest.toISOString()}`);
    console.log('Leagues involved:', Array.from(leagues).join(', '));
};

analyzeBacklog();
