import pool from '../shared/database';

const initDB = async () => {
    const client = await pool.connect();
    try {
        console.log('🚀 Starting Database Initialization...');

        // 1. Run Migrations
        console.log('📝 Running Migrations...');
        const schema = `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
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
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS soccer_predictions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                match_id VARCHAR(50) REFERENCES soccer_matches(match_id),
                prediction_data JSONB NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, match_id)
            );

            CREATE TABLE IF NOT EXISTS announcements (
                id SERIAL PRIMARY KEY,
                room_id VARCHAR(50) REFERENCES rooms(room_id),
                type VARCHAR(50), 
                title VARCHAR(255) NOT NULL,
                description TEXT,
                is_draft BOOLEAN DEFAULT false,
                scheduled_for TIMESTAMP WITH TIME ZONE,
                published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by INTEGER
            );
        `;
        await client.query(schema);
        console.log('✅ Schema applied successfully.');

        // 2. Seed Data
        console.log('🌱 Seeding initial data...');

        // Seed Rooms
        await client.query(`
            INSERT INTO rooms (room_id, display_name)
            VALUES ('soccer', 'Pro Soccer')
            ON CONFLICT (room_id) DO NOTHING;
        `);

        // Seed Soccer Matches
        const matches = [
            { id: 'match_1', home: 'Arsenal', away: 'Chelsea', time: new Date(Date.now() + 3600000).toISOString(), status: 'scheduled' },
            { id: 'match_2', home: 'Man City', away: 'Liverpool', time: new Date(Date.now() + 7200000).toISOString(), status: 'scheduled' },
            { id: 'match_3', home: 'Real Madrid', away: 'Barcelona', time: new Date(Date.now() - 3600000).toISOString(), status: 'live', score_home: 1, score_away: 0 },
        ];

        for (const m of matches) {
            await client.query(`
                INSERT INTO soccer_matches (match_id, home_team, away_team, start_time, status, score_home, score_away)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (match_id) DO UPDATE SET 
                    status = EXCLUDED.status,
                    score_home = EXCLUDED.score_home,
                    score_away = EXCLUDED.score_away;
            `, [m.id, m.home, m.away, m.time, m.status, m.score_home || 0, m.score_away || 0]);
        }

        // Seed Sample Announcement
        await client.query(`
            INSERT INTO announcements (room_id, type, title, description, is_draft, published_at)
            VALUES ('soccer', 'live', 'Welcome to Phase 3!', 'Real-time announcements are now live. Check out the Admin Panel to post your own!', false, CURRENT_TIMESTAMP)
            ON CONFLICT DO NOTHING;
        `);

        console.log('✅ Database initialization completed successfully.');
    } catch (err) {
        console.error('❌ Database initialization FAILED:', err);
        process.exit(1); // Exit with error code so Render stops the startCommand
    } finally {
        client.release();
        process.exit(0);
    }
};

initDB();
