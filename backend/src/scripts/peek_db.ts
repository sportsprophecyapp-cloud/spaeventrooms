import pool from '../shared/database';

async function peek() {
    try {
        const res = await pool.query("SELECT home_team, home_logo FROM nhl_matches WHERE home_team LIKE '%Montréal%' LIMIT 1");
        console.log('MONTREAL CHECK:', JSON.stringify(res.rows, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
peek();
