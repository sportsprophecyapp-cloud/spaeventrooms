require('dotenv').config({path: '.env'});
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
async function test() {
  await client.connect();
  const res = await client.query(`
    SELECT home_team, away_team, start_time, COUNT(*) 
    FROM nhl_matches 
    GROUP BY home_team, away_team, start_time 
    HAVING COUNT(*) > 1
  `);
  console.log("NHL duplicates:", res.rows);
  
  const res2 = await client.query(`
    SELECT home_team, away_team, start_time, COUNT(*) 
    FROM soccer_matches 
    GROUP BY home_team, away_team, start_time 
    HAVING COUNT(*) > 1
  `);
  console.log("Soccer duplicates:", res2.rows);

  await client.end();
}
test();
