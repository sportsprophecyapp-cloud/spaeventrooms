import pool from '../shared/database';

const initDB = async () => {
    const client = await pool.connect();
    try {
        console.log('🚀 Starting Robust Database Initialization (v3.2 - Token Backfill)...');

        const schema = `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                username VARCHAR(50) UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'user',
                token_balance INTEGER DEFAULT 150,
                total_points INTEGER DEFAULT 0,
                current_level INTEGER DEFAULT 1,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            -- ... Rest of the schema (Rooms, Matches, Predictions, Chat, Cosmetics, Draws) ...
            -- Keeping the existing stable schema definitions
            CREATE TABLE IF NOT EXISTS rooms (
                room_id VARCHAR(50) PRIMARY KEY,
                display_name VARCHAR(100) NOT NULL,
                config JSONB DEFAULT '{}',
                is_active BOOLEAN DEFAULT TRUE,
                owner_id INTEGER REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS soccer_matches (
                match_id VARCHAR(50) PRIMARY KEY, home_team VARCHAR(100) NOT NULL, away_team VARCHAR(100) NOT NULL,
                start_time TIMESTAMP WITH TIME ZONE NOT NULL, status VARCHAR(20) DEFAULT 'scheduled',
                score_home INTEGER DEFAULT 0, score_away INTEGER DEFAULT 0, league VARCHAR(100),
                league_logo TEXT, data JSONB DEFAULT '{}', updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS soccer_predictions (
                id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                match_id VARCHAR(50) REFERENCES soccer_matches(match_id) ON DELETE CASCADE,
                prediction_data JSONB NOT NULL, result VARCHAR(20) DEFAULT 'pending',
                points_earned INTEGER DEFAULT 0, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, match_id)
            );

            CREATE TABLE IF NOT EXISTS room_messages (
                id SERIAL PRIMARY KEY, room_id VARCHAR(50) NOT NULL REFERENCES rooms(room_id),
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, username VARCHAR(50),
                content TEXT NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS prize_draws (
                id SERIAL PRIMARY KEY, title VARCHAR(255) NOT NULL, prize_description TEXT,
                room_id VARCHAR(50) REFERENCES rooms(room_id), sponsor_id INTEGER,
                status VARCHAR(20) DEFAULT 'active', draw_date TIMESTAMP WITH TIME ZONE,
                winner_id INTEGER REFERENCES users(id), created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS prize_draw_entries (
                id SERIAL PRIMARY KEY, draw_id INTEGER REFERENCES prize_draws(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, entry_type VARCHAR(50) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await client.query(schema);

        // 2. CRITICAL FIX: Backfill tokens for existing users who have 0 or NULL
        console.log('🔧 Backfilling tokens and ensuring data integrity...');
        await client.query(`
            UPDATE users SET token_balance = 150 WHERE token_balance IS NULL OR token_balance = 0;
            UPDATE users SET total_points = 0 WHERE total_points IS NULL;
            UPDATE users SET role = 'super_admin' WHERE email = 'sportsprophecyapp@gmail.com';
        `);

        // 3. Ensure Soccer Room exists
        await client.query(`
            INSERT INTO rooms (room_id, display_name) VALUES ('soccer', 'Soccer Arena')
            ON CONFLICT (room_id) DO UPDATE SET display_name = EXCLUDED.display_name;
        `);

        console.log('✅ DB Update Complete: Everyone now has their starting tokens!');
    } catch (err) {
        console.error('❌ DB Init failed:', err);
        process.exit(1);
    } finally {
        client.release();
        process.exit(0);
    }
};

initDB();
