import pool from '../shared/database';

const initDB = async () => {
    const client = await pool.connect();
    try {
        console.log('🚀 Starting Robust Database Initialization (v2.6)...');

        const schema = `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                username VARCHAR(50) UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                token_balance INTEGER DEFAULT 150,
                total_points INTEGER DEFAULT 0,
                current_level INTEGER DEFAULT 1,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS rooms (
                room_id VARCHAR(50) PRIMARY KEY,
                display_name VARCHAR(100) NOT NULL,
                config JSONB DEFAULT '{}',
                is_active BOOLEAN DEFAULT TRUE
            );

            CREATE TABLE IF NOT EXISTS soccer_matches (
                match_id VARCHAR(50) PRIMARY KEY,
                home_team VARCHAR(100) NOT NULL,
                away_team VARCHAR(100) NOT NULL,
                start_time TIMESTAMP WITH TIME ZONE NOT NULL,
                status VARCHAR(20) DEFAULT 'scheduled',
                score_home INTEGER DEFAULT 0,
                score_away INTEGER DEFAULT 0,
                league VARCHAR(100),
                league_logo TEXT,
                data JSONB DEFAULT '{}',
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS custom_predictions (
                id SERIAL PRIMARY KEY,
                room_id VARCHAR(50) REFERENCES rooms(room_id) ON DELETE CASCADE,
                question TEXT NOT NULL,
                options JSONB NOT NULL,
                correct_answer VARCHAR(255),
                closes_at TIMESTAMP WITH TIME ZONE,
                revealed_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by INTEGER
            );

            CREATE TABLE IF NOT EXISTS prediction_submissions (
                id SERIAL PRIMARY KEY,
                prediction_id INTEGER REFERENCES custom_predictions(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                selected_option VARCHAR(255) NOT NULL,
                is_correct BOOLEAN,
                submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(prediction_id, user_id)
            );

            CREATE TABLE IF NOT EXISTS room_messages (
                id SERIAL PRIMARY KEY,
                room_id VARCHAR(50) NOT NULL REFERENCES rooms(room_id),
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                username VARCHAR(50),
                content TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS user_streaks (
                user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                current_streak INTEGER DEFAULT 0,
                last_login_date TIMESTAMP WITH TIME ZONE,
                longest_streak INTEGER DEFAULT 0,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS cosmetics (
                id VARCHAR(100) PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                type VARCHAR(50) NOT NULL,
                cost INTEGER NOT NULL,
                asset_url TEXT NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS user_cosmetics (
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                cosmetic_id VARCHAR(100) REFERENCES cosmetics(id) ON DELETE CASCADE,
                is_equipped BOOLEAN DEFAULT FALSE,
                acquired_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, cosmetic_id)
            );
        `;
        await client.query(schema);
        console.log('✅ Schema applied successfully.');

        // 2. Fix Missing Usernames (Critical for UI)
        console.log('🔧 Fixing missing usernames...');
        await client.query(`
            UPDATE users 
            SET username = split_part(email, '@', 1) 
            WHERE username IS NULL OR username = '';
        `);

        // 3. Seed Essential Data
        console.log('🌱 Seeding starter content...');
        await client.query(`
            INSERT INTO rooms (room_id, display_name) VALUES ('soccer', 'Pro Soccer Arena')
            ON CONFLICT (room_id) DO UPDATE SET display_name = EXCLUDED.display_name;

            -- Starter Polls
            INSERT INTO custom_predictions (room_id, question, options, closes_at) VALUES 
            ('soccer', 'Will there be a Red Card in any match today?', '["YES", "NO"]', NOW() + INTERVAL '24 hours'),
            ('soccer', 'Which league will have the most goals today?', '["Premier League", "La Liga", "MLS"]', NOW() + INTERVAL '24 hours'),
            ('soccer', 'Will any goalkeeper keep a clean sheet today?', '["YES", "NO"]', NOW() + INTERVAL '24 hours')
            ON CONFLICT DO NOTHING;

            -- Starter Cosmetics
            INSERT INTO cosmetics (id, name, description, type, cost, asset_url) VALUES 
            ('avatar_basic', 'Blue Prophet', 'Standard apprentice avatar', 'avatar', 0, 'https://via.placeholder.com/150/0070f3'),
            ('avatar_premium', 'Neon King', 'Master predictor avatar', 'avatar', 500, 'https://via.placeholder.com/150/00ff41'),
            ('frame_gold', 'Gold Frame', 'Exclusive winner border', 'frame', 300, 'https://via.placeholder.com/150/ffd700')
            ON CONFLICT (id) DO NOTHING;
        `);

        console.log('✅ Initialization completed successfully.');
    } catch (err) {
        console.error('❌ Database initialization FAILED:', err);
        process.exit(1);
    } finally {
        client.release();
        process.exit(0);
    }
};

initDB();
