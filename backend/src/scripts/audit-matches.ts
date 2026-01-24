import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import { query } from '../shared/database';

const auditMatches = async () => {
    console.log('🔍 Auditing Jan 19 La Liga Matches...');

    try {
        const matches = await query(`
            SELECT match_id, home_team, away_team, status, score_home, score_away, start_time 
            FROM soccer_matches 
            WHERE (home_team LIKE '%Girona%' OR home_team LIKE '%Alavés%' OR home_team LIKE '%Barcelona%' OR home_team LIKE '%Sevilla%')
            AND start_time > '2026-01-18' AND start_time < '2026-01-21'
        `);

        if (matches.rows.length === 0) {
            console.log('❌ No matching games found for Jan 19 audit.');
            return;
        }

        console.log(`📊 Audit Results (${matches.rows.length} games):`);
        matches.rows.forEach(m => {
            console.log(`- [${m.status}] ${m.home_team} ${m.score_home}-${m.score_away} ${m.away_team} | ID: ${m.match_id}`);
        });

    } catch (err) {
        console.error('❌ Audit failed:', err);
    } finally {
        process.exit(0);
    }
};

auditMatches();
