require('dotenv').config({path: '.env'});
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
async function test() {
  await client.connect();
  try {
    const res = await client.query(`
            SELECT * FROM (
                SELECT home_team, away_team, score_home, score_away, status, start_time, 'soccer' as sport
                FROM soccer_matches
                WHERE status = 'live'
                   OR (status = 'finished' AND updated_at > CURRENT_TIMESTAMP - INTERVAL '48 hours')
                   OR (status = 'scheduled' AND start_time < CURRENT_TIMESTAMP + INTERVAL '7 days')
                UNION ALL
                SELECT home_team, away_team, score_home, score_away, status, start_time, 'nhl' as sport
                FROM nhl_matches
                WHERE status = 'live'
                   OR (status = 'finished' AND updated_at > CURRENT_TIMESTAMP - INTERVAL '48 hours')
                   OR (status = 'scheduled' AND start_time < CURRENT_TIMESTAMP + INTERVAL '7 days')
            ) as combined_matches
            ORDER BY 
                CASE WHEN status = 'live' THEN 0 WHEN status = 'scheduled' THEN 1 ELSE 2 END ASC,
                start_time ASC
            LIMIT 15;
    `);
    console.log("Fixed Query 1 success", res.rows.length);
  } catch (e) {
    console.error("Fixed Query 1 failed", e.message);
  }
  await client.end();
}
test();
