import pool from '../shared/database';

const check = async () => {
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT home_team, home_logo FROM soccer_matches WHERE home_logo IS NOT NULL LIMIT 5');
        console.log(JSON.stringify(res.rows, null, 2));
    } finally {
        client.release();
        process.exit(0);
    }
};
check();
