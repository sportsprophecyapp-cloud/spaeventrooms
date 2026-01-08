import pool from '../shared/database';

const initDB = async () => {
    const client = await pool.connect();
    try {
        console.log('🚀 Starting Economy Integrity Sync (v3.7 - Prediction Result)...');

        const schema = `
            -- 1. Ensure predictions table has result tracking
            ALTER TABLE soccer_predictions ADD COLUMN IF NOT EXISTS result VARCHAR(20) DEFAULT 'pending';
            ALTER TABLE soccer_predictions ADD COLUMN IF NOT EXISTS points_earned INTEGER DEFAULT 0;

            -- 2. Ensure user table has all economy columns
            ALTER TABLE users ADD COLUMN IF NOT EXISTS token_balance INTEGER DEFAULT 150;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS total_tickets INTEGER DEFAULT 0;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 1;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;
        `;
        await client.query(schema);

        console.log('✅ DB Initialized: Prediction result tracking is now active.');
    } catch (err) {
        console.error('❌ DB sync failed:', err);
    } finally {
        client.release();
        process.exit(0);
    }
};

initDB();
