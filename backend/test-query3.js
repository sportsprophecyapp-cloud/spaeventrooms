require('dotenv').config({path: '.env'});
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
async function test() {
  await client.connect();
  const res3 = await client.query(`
            WITH all_match_sentiment AS (
                SELECT 
                    'nhl' as room_id,
                    m.match_id,
                    m.home_team,
                    m.away_team,
                    m.start_time,
                    COUNT(p.user_id) as total_votes
                FROM nhl_matches m
                LEFT JOIN nhl_predictions p ON m.match_id = p.match_id
                WHERE m.start_time > CURRENT_TIMESTAMP
                GROUP BY m.match_id, m.home_team, m.away_team, m.start_time
                UNION ALL
                SELECT 
                    'soccer' as room_id,
                    m.match_id,
                    m.home_team,
                    m.away_team,
                    m.start_time,
                    COUNT(p.user_id) as total_votes
                FROM soccer_matches m
                LEFT JOIN soccer_predictions p ON m.match_id = p.match_id
                WHERE m.start_time > CURRENT_TIMESTAMP
                GROUP BY m.match_id, m.home_team, m.away_team, m.start_time
            )
            SELECT *
            FROM all_match_sentiment
            ORDER BY total_votes DESC
            LIMIT 5;
  `);
  console.log(res3.rows);
  await client.end();
}
test();
