require('dotenv').config({path: '.env'});
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
async function test() {
  await client.connect();
  try {
    const res = await client.query(`
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
            ORDER BY 
                CASE WHEN status = 'live' THEN 0 WHEN status = 'scheduled' THEN 1 ELSE 2 END ASC,
                start_time ASC
            LIMIT 15;
    `);
    console.log("Query 1 success", res.rows.length);
  } catch (e) {
    console.error("Query 1 failed", e.message);
  }

  try {
    const res2 = await client.query(`
        (SELECT home_team, away_team, score_home, score_away, status, start_time, 'soccer' as sport
         FROM soccer_matches 
         WHERE status IN ('scheduled', 'live')
            OR (status = 'finished' AND updated_at > CURRENT_TIMESTAMP - INTERVAL '72 hours')
         ORDER BY start_time DESC LIMIT 8)
        UNION ALL
        (SELECT home_team, away_team, score_home, score_away, status, start_time, 'nhl' as sport
         FROM nhl_matches 
         WHERE status IN ('scheduled', 'live')
            OR (status = 'finished' AND updated_at > CURRENT_TIMESTAMP - INTERVAL '72 hours')
         ORDER BY start_time DESC LIMIT 7)
        ORDER BY start_time ASC
        LIMIT 15;
    `);
    console.log("Query 2 success", res2.rows.length);
  } catch (e) {
    console.error("Query 2 failed", e.message);
  }

  // test pulse picks query
  try {
    const res3 = await client.query(`
            WITH all_match_sentiment AS (
                SELECT 
                    'nhl' as room_id,
                    m.match_id,
                    m.home_team,
                    m.away_team,
                    m.home_logo,
                    m.away_logo,
                    m.start_time,
                    COUNT(p.user_id) as total_votes,
                    COUNT(CASE WHEN p.prediction_data->>'pick' = m.home_team THEN 1 END) as home_votes,
                    COUNT(CASE WHEN p.prediction_data->>'pick' = m.away_team THEN 1 END) as away_votes
                FROM nhl_matches m
                LEFT JOIN nhl_predictions p ON m.match_id = p.match_id
                WHERE m.start_time > CURRENT_TIMESTAMP
                GROUP BY m.match_id, m.home_team, m.away_team, m.home_logo, m.away_logo, m.start_time
                UNION ALL
                SELECT 
                    'soccer' as room_id,
                    m.match_id,
                    m.home_team,
                    m.away_team,
                    m.home_logo,
                    m.away_logo,
                    m.start_time,
                    COUNT(p.user_id) as total_votes,
                    COUNT(CASE WHEN p.prediction_data->>'pick' = m.home_team THEN 1 END) as home_votes,
                    COUNT(CASE WHEN p.prediction_data->>'pick' = m.away_team THEN 1 END) as away_votes
                FROM soccer_matches m
                LEFT JOIN soccer_predictions p ON m.match_id = p.match_id
                WHERE m.start_time > CURRENT_TIMESTAMP
                GROUP BY m.match_id, m.home_team, m.away_team, m.home_logo, m.away_logo, m.start_time
            )
            SELECT *,
                   CASE 
                     WHEN total_votes > 0 THEN ABS((home_votes::float / total_votes) - 0.5)
                     ELSE 1.0 
                   END as heat_index
            FROM all_match_sentiment
            WHERE total_votes >= 0
            ORDER BY total_votes DESC
            LIMIT 10;
    `);
    console.log("Query 3 success", res3.rows.length);
  } catch (e) {
    console.error("Query 3 failed", e.message);
  }
  await client.end();
}
test();
