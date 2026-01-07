import pool from '../shared/database';

const initDB = async () => {
    const client = await pool.connect();
    try {
        console.log('🚀 Starting Pure-Data Database Initialization (v3.1 - Global Branding Sync)...');

        const schema = `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                username VARCHAR(50) UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'user', -- 'super_admin', 'admin', 'creator', 'user'
                token_balance INTEGER DEFAULT 150,
                total_points INTEGER DEFAULT 0,
                current_level INTEGER DEFAULT 1,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS rooms (
                room_id VARCHAR(50) PRIMARY KEY,
                display_name VARCHAR(100) NOT NULL,
                config JSONB DEFAULT '{}',
                is_active BOOLEAN DEFAULT TRUE,
                owner_id INTEGER REFERENCES users(id)
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

            CREATE TABLE IF NOT EXISTS token_transactions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                amount INTEGER NOT NULL,
                type VARCHAR(50) NOT NULL,
                description TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS prize_draws (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                prize_description TEXT,
                room_id VARCHAR(50) REFERENCES rooms(room_id),
                sponsor_id INTEGER,
                status VARCHAR(20) DEFAULT 'active',
                draw_date TIMESTAMP WITH TIME ZONE,
                winner_id INTEGER REFERENCES users(id),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS prize_draw_entries (
                id SERIAL PRIMARY KEY,
                draw_id INTEGER REFERENCES prize_draws(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                entry_type VARCHAR(50) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await client.query(schema);

        // 2. Fix Missing Usernames & Admin Roles
        await client.query(`
            UPDATE users SET username = split_part(email, '@', 1) WHERE username IS NULL OR username = '';
            UPDATE users SET role = 'super_admin' WHERE email = 'sportsprophecyapp@gmail.com';
        `);

        // 3. Seed Content (Clean, Modern Sports Wording)
        await client.query(`
            INSERT INTO rooms (room_id, display_name) VALUES ('soccer', 'Soccer Room')
            ON CONFLICT (room_id) DO UPDATE SET display_name = EXCLUDED.display_name;

            INSERT INTO cosmetics (id, name, description, type, cost, asset_url) VALUES 
            ('avatar_basic', 'Rookie Pro', 'Entry-level player avatar', 'avatar', 0, 'https://via.placeholder.com/150/0070f3'),
            ('avatar_premium', 'Elite Legend', 'Top-tier status avatar', 'avatar', 500, 'https://via.placeholder.com/150/00ff41'),
            ('frame_gold', 'Champion Aura', 'Exclusive winner border', 'frame', 300, 'https://via.placeholder.com/150/ffd700')
            ON CONFLICT (id) DO NOTHING;
        `);

        console.log('✅ Branding Updated: Terminology is now modern and non-religious.');
    } catch (err) {
        console.error('❌ DB Init failed:', err);
        process.exit(1);
    } finally {
        client.release();
        process.exit(0);
    }
};

initDB();
