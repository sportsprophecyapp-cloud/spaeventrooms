import pool from '../shared/database';

const initDB = async () => {
    const client = await pool.connect();
    try {
        console.log('🚀 Starting Consolidated Database Initialization (v2.3)...');

        // 1. Core Schema
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

            CREATE TABLE IF NOT EXISTS soccer_predictions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                match_id VARCHAR(50) REFERENCES soccer_matches(match_id) ON DELETE CASCADE,
                prediction_data JSONB NOT NULL,
                result VARCHAR(20) DEFAULT 'pending',
                points_earned INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, match_id)
            );

            CREATE TABLE IF NOT EXISTS room_messages (
                id SERIAL PRIMARY KEY,
                room_id VARCHAR(50) NOT NULL REFERENCES rooms(room_id),
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                username VARCHAR(50),
                content TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_room_messages_room_id ON room_messages(room_id);

            CREATE TABLE IF NOT EXISTS user_streaks (
                user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                current_streak INTEGER DEFAULT 0,
                last_login_date TIMESTAMP WITH TIME ZONE,
                longest_streak INTEGER DEFAULT 0,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS cosmetics (
                id VARCHAR(50) PRIMARY KEY,
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
                cosmetic_id VARCHAR(50) REFERENCES cosmetics(id) ON DELETE CASCADE,
                is_equipped BOOLEAN DEFAULT FALSE,
                acquired_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, cosmetic_id)
            );

            CREATE TABLE IF NOT EXISTS token_transactions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                amount INTEGER NOT NULL,
                type VARCHAR(50) NOT NULL,
                description TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS room_sponsors (
                id SERIAL PRIMARY KEY,
                room_id VARCHAR(50) REFERENCES rooms(room_id),
                name VARCHAR(100) NOT NULL,
                logo_url TEXT,
                link_url TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS announcements (
                id SERIAL PRIMARY KEY,
                room_id VARCHAR(50) REFERENCES rooms(room_id),
                type VARCHAR(50), 
                title VARCHAR(255) NOT NULL,
                description TEXT,
                is_draft BOOLEAN DEFAULT false,
                published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by INTEGER REFERENCES users(id)
            );
        `;
        await client.query(schema);
        console.log('✅ Base Schema applied successfully.');

        const updates = `
            ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS token_balance INTEGER DEFAULT 150;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 1;
            
            ALTER TABLE soccer_matches ADD COLUMN IF NOT EXISTS league VARCHAR(100);
            ALTER TABLE soccer_matches ADD COLUMN IF NOT EXISTS league_logo TEXT;
            
            ALTER TABLE soccer_predictions ADD COLUMN IF NOT EXISTS result VARCHAR(20) DEFAULT 'pending';
            ALTER TABLE soccer_predictions ADD COLUMN IF NOT EXISTS points_earned INTEGER DEFAULT 0;
        `;
        await client.query(updates);
        console.log('✅ Column updates applied.');

        // 3. Seed Data
        await client.query(`
            INSERT INTO rooms (room_id, display_name) VALUES ('soccer', 'Pro Soccer Arena')
            ON CONFLICT (room_id) DO UPDATE SET display_name = EXCLUDED.display_name;

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
