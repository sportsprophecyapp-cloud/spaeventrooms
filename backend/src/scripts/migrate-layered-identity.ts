import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load env from the backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

async function runMigration() {
    const client = await pool.connect();
    console.log('Connected to database. Starting migration...');

    try {
        await client.query('BEGIN');

        console.log('1. Adding layered identity columns to users table...');
        
        // Add new columns if they don't exist
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS max_streak INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS draws_won INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS arena_stats JSONB DEFAULT '{}'::jsonb;
        `);

        console.log('2. Calculating historical arena stats from predictions...');

        // Fetch all predictions that have a status of 'win' or 'loss'
        // We will build an aggregation per user per arena.
        const result = await client.query(`
            WITH all_picks AS (
                SELECT user_id, 'soccer' as room_id, result FROM soccer_predictions WHERE result IN ('win', 'loss')
                UNION ALL
                SELECT user_id, 'nhl' as room_id, result FROM nhl_predictions WHERE result IN ('win', 'loss')
            )
            SELECT 
                user_id,
                room_id,
                COUNT(*) as total_picks,
                SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END) as correct_picks
            FROM all_picks
            GROUP BY user_id, room_id
        `);

        console.log(`Found ${result.rows.length} user-arena stat aggregations.`);

        // Group by user
        const userStats: Record<string, any> = {};
        for (const row of result.rows) {
            if (!userStats[row.user_id]) {
                userStats[row.user_id] = {};
            }
            userStats[row.user_id][row.room_id] = {
                total_picks: parseInt(row.total_picks, 10),
                correct_picks: parseInt(row.correct_picks, 10)
            };
        }

        console.log(`Updating arena_stats for ${Object.keys(userStats).length} users...`);

        // Update each user
        let updateCount = 0;
        for (const [userId, stats] of Object.entries(userStats)) {
            await client.query(
                `UPDATE users SET arena_stats = $1 WHERE id = $2`,
                [JSON.stringify(stats), userId]
            );
            updateCount++;
        }

        console.log(`Successfully updated ${updateCount} users with historical arena stats.`);

        await client.query('COMMIT');
        console.log('Migration completed successfully.');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed, rolled back:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();
