import pool from '../shared/database';

const initDB = async () => {
    const client = await pool.connect();
    try {
        console.log('🚀 Starting Granular Permissions DB Sync (v3.8)...');

        const schema = `
            -- 1. Drop the old 'role' column if it exists
            ALTER TABLE users DROP COLUMN IF EXISTS role;

            -- 2. Add a flexible JSONB column for permissions
            ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '["supporter"]'::jsonb;

            -- 3. Ensure prediction tracking is active
            ALTER TABLE soccer_predictions ADD COLUMN IF NOT EXISTS result VARCHAR(20) DEFAULT 'pending';
            ALTER TABLE soccer_predictions ADD COLUMN IF NOT EXISTS points_earned INTEGER DEFAULT 0;

            -- 4. Ensure all economy columns exist
            ALTER TABLE users ADD COLUMN IF NOT EXISTS token_balance INTEGER DEFAULT 150;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS total_tickets INTEGER DEFAULT 0;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 1;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;

            -- 5. Prize Draw System
            CREATE TABLE IF NOT EXISTS prize_draws (
                id SERIAL PRIMARY KEY,
                title VARCHAR(100) NOT NULL,
                prize VARCHAR(255) NOT NULL,
                description TEXT,
                room_id VARCHAR(50) DEFAULT 'soccer',
                status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed'
                winner_id INTEGER REFERENCES users(id),
                draw_date TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS prize_draw_entries (
                id SERIAL PRIMARY KEY,
                draw_id INTEGER REFERENCES prize_draws(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                entry_type VARCHAR(20) NOT NULL, -- 'streak', 'referral', 'accuracy'
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- 6. Sponsor Application & Review System (Consolidated v3.9)
            CREATE TABLE IF NOT EXISTS sponsor_applications (
                id SERIAL PRIMARY KEY,
                brand_name VARCHAR(100) NOT NULL,
                contact_email VARCHAR(100) NOT NULL,
                website_url VARCHAR(255),
                arena_target VARCHAR(50) NOT NULL,
                frequency VARCHAR(50) DEFAULT 'monthly',
                prize_quantity INTEGER DEFAULT 1,
                prize_description TEXT NOT NULL,
                logo_url TEXT, -- URL or Base64
                prize_image_url TEXT, -- URL or Base64
                creative_config JSONB, -- Stores X, Y, Scale for Founders Package
                status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'denied'
                agreed_to_terms BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                reviewed_at TIMESTAMP,
                reviewed_by INTEGER REFERENCES users(id)
            );

            -- 7. Room Sponsors (Live Placements)
            CREATE TABLE IF NOT EXISTS room_sponsors (
                id SERIAL PRIMARY KEY,
                room_id VARCHAR(50) NOT NULL,
                sponsor_name VARCHAR(100) NOT NULL, -- Renamed from name for consistency
                logo_url TEXT,
                website_url TEXT,
                link_url TEXT,
                prize_description TEXT,
                application_id INTEGER REFERENCES sponsor_applications(id),
                is_active BOOLEAN DEFAULT TRUE,
                auto_place BOOLEAN DEFAULT FALSE,
                prize_escrow_received BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await client.query(schema);

        // Set your user as the SUPER ADMIN
        await client.query("UPDATE users SET permissions = '[\"super_admin\"]'::jsonb WHERE email = 'sportsprophecyapp@gmail.com'");

        console.log('✅ DB Initialized: Granular permissions system is now active.');
    } catch (err) {
        console.error('❌ DB sync failed:', err);
    } finally {
        client.release();
        process.exit(0);
    }
};

initDB();
