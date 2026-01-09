import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const cleanupMockData = async () => {
    const client = await pool.connect();
    try {
        console.log('🧹 Purging MOCK data from database...');

        // Truncate matches to ensure only fresh live data from API
        const result = await client.query(`TRUNCATE soccer_matches RESTART IDENTITY CASCADE;`);
        console.log(`✅ Table soccer_matches truncated.`);
    } catch (err) {
        console.error('❌ Failed to purge mock data:', err);
    } finally {
        client.release();
        process.exit(0);
    }
};

cleanupMockData();
