import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const listMatches = async () => {
    const client = await pool.connect();
    try {
        console.log('📋 Listing all matches in database...');
        const result = await client.query('SELECT match_id, home_team, away_team, league, status FROM soccer_matches LIMIT 20;');
        console.table(result.rows);
    } catch (err) {
        console.error('❌ Failed to list matches:', err);
    } finally {
        client.release();
        process.exit(0);
    }
};

listMatches();
