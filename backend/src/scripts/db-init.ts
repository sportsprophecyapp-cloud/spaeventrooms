import pool from '../shared/database';

const initDB = async () => {
    const client = await pool.connect();
    try {
        console.log('🚀 Starting Pure-Economy Database Initialization (v3.4 - Ticket & XP Sync)...');

        const schema = `
            -- 1. Ensure user table has all economy columns
            ALTER TABLE users ADD COLUMN IF NOT EXISTS token_balance INTEGER DEFAULT 150;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS total_tickets INTEGER DEFAULT 0;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 1;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;

            -- 2. Ensure Ticket Tracking table exists
            CREATE TABLE IF NOT EXISTS prize_draw_entries (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                room_id VARCHAR(50) DEFAULT 'soccer',
                entry_type VARCHAR(50) NOT NULL, -- 'accuracy', 'streak', 'referral'
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            -- 3. Ensure Transaction Logging for audit
            CREATE TABLE IF NOT EXISTS economy_transactions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                amount INTEGER NOT NULL,
                currency_type VARCHAR(20) NOT NULL, -- 'tokens', 'tickets', 'xp'
                reason TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await client.query(schema);

        // SYNC: Ensure everyone has their starting 150 tokens
        await client.query("UPDATE users SET token_balance = 150 WHERE token_balance IS NULL OR token_balance = 0");

        console.log('✅ DB Initialized: Economy systems (Tokens, XP, Tickets) are now logically unified.');
    } catch (err) {
        console.error('❌ DB Economy sync failed:', err);
    } finally {
        client.release();
        process.exit(0);
    }
};

initDB();
