import pool from '../shared/database';
import { updateDatabaseLogos } from './update_database_logos';

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
            ALTER TABLE soccer_matches ADD COLUMN IF NOT EXISTS home_logo TEXT;
            ALTER TABLE soccer_matches ADD COLUMN IF NOT EXISTS away_logo TEXT;
            ALTER TABLE soccer_matches ADD COLUMN IF NOT EXISTS league VARCHAR(100);
            ALTER TABLE soccer_matches ADD COLUMN IF NOT EXISTS league_logo TEXT;
            ALTER TABLE soccer_matches ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}';
            ALTER TABLE soccer_matches ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

            -- 5. Sponsor Application & Review System (Consolidated v3.9)
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

            -- 5.1 Ensure sponsor_applications columns (Schema Evolution for v4.7)
            ALTER TABLE sponsor_applications ADD COLUMN IF NOT EXISTS brand_name VARCHAR(100);
            ALTER TABLE sponsor_applications ADD COLUMN IF NOT EXISTS arena_target VARCHAR(50) DEFAULT 'soccer';
            ALTER TABLE sponsor_applications ADD COLUMN IF NOT EXISTS frequency VARCHAR(50) DEFAULT 'monthly';
            ALTER TABLE sponsor_applications ADD COLUMN IF NOT EXISTS prize_quantity INTEGER DEFAULT 1;
            ALTER TABLE sponsor_applications ADD COLUMN IF NOT EXISTS prize_description TEXT;
            ALTER TABLE sponsor_applications ADD COLUMN IF NOT EXISTS prize_image_url TEXT;
            ALTER TABLE sponsor_applications ADD COLUMN IF NOT EXISTS creative_config JSONB;
            ALTER TABLE sponsor_applications ADD COLUMN IF NOT EXISTS agreed_to_terms BOOLEAN DEFAULT FALSE;
            ALTER TABLE sponsor_applications ADD COLUMN IF NOT EXISTS stripe_session_id VARCHAR(255);

            -- 5.2 Room Sponsors (Live Placements)
            CREATE TABLE IF NOT EXISTS room_sponsors (
                id SERIAL PRIMARY KEY,
                room_id VARCHAR(50) NOT NULL,
                sponsor_name VARCHAR(100) NOT NULL,
                logo_url TEXT,
                website_url TEXT,
                prize_description TEXT,
                application_id INTEGER REFERENCES sponsor_applications(id),
                is_active BOOLEAN DEFAULT TRUE,
                auto_place BOOLEAN DEFAULT FALSE,
                prize_escrow_received BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
 
            -- 5.3 Sync room_sponsors for v4.8
            ALTER TABLE room_sponsors ADD COLUMN IF NOT EXISTS prize_description TEXT;
            ALTER TABLE room_sponsors ADD COLUMN IF NOT EXISTS application_id INTEGER REFERENCES sponsor_applications(id);
            ALTER TABLE room_sponsors ADD COLUMN IF NOT EXISTS prize_escrow_received BOOLEAN DEFAULT FALSE;
            ALTER TABLE room_sponsors ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

            -- 6. Prize Draw System (Depends on Room Sponsors)
            CREATE TABLE IF NOT EXISTS prize_draws (
                id SERIAL PRIMARY KEY,
                title VARCHAR(100) NOT NULL,
                prize VARCHAR(255) NOT NULL,
                description TEXT,
                room_id VARCHAR(50) DEFAULT 'soccer',
                status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed'
                winner_id INTEGER REFERENCES users(id),
                sponsor_id INTEGER REFERENCES room_sponsors(id),
                prize_image TEXT,
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

            -- 6.1 Ensure prize_draws columns (Safety for existing tables)
            ALTER TABLE prize_draws ADD COLUMN IF NOT EXISTS title VARCHAR(100);
            ALTER TABLE prize_draws ADD COLUMN IF NOT EXISTS prize VARCHAR(255);
            ALTER TABLE prize_draws ADD COLUMN IF NOT EXISTS draw_date TIMESTAMP;
            ALTER TABLE prize_draws ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
            ALTER TABLE prize_draws ADD COLUMN IF NOT EXISTS winner_id INTEGER REFERENCES users(id);
            ALTER TABLE prize_draws ADD COLUMN IF NOT EXISTS sponsor_id INTEGER REFERENCES room_sponsors(id);
            ALTER TABLE prize_draws ADD COLUMN IF NOT EXISTS prize_image TEXT;


            -- 7. Schema Evolution Fixes (v4.7.1)
            ALTER TABLE sponsor_applications ALTER COLUMN logo_url TYPE TEXT;
            ALTER TABLE sponsor_applications ALTER COLUMN prize_image_url TYPE TEXT;
            ALTER TABLE sponsor_applications ALTER COLUMN website_url TYPE TEXT;
            ALTER TABLE sponsor_applications ALTER COLUMN contact_email TYPE VARCHAR(255);
            ALTER TABLE sponsor_applications ALTER COLUMN brand_name SET NOT NULL;

            DO $$ 
            BEGIN 
                -- Rename 'name' to 'sponsor_name' if it exists
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='room_sponsors' AND column_name='name') THEN
                    ALTER TABLE room_sponsors RENAME COLUMN name TO sponsor_name;
                END IF;
                -- Rename 'link_url' to 'website_url' if it exists
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='room_sponsors' AND column_name='link_url') THEN
                    ALTER TABLE room_sponsors RENAME COLUMN link_url TO website_url;
                END IF;
            END $$;


            -- 8. Gamification & Cosmetics (Phase 9 & 10)
            ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by_id INTEGER REFERENCES users(id);
            ALTER TABLE users ADD COLUMN IF NOT EXISTS consecutive_login_days INTEGER DEFAULT 0;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS can_upload_custom BOOLEAN DEFAULT FALSE;

            CREATE TABLE IF NOT EXISTS cosmetics (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                type VARCHAR(50) NOT NULL, -- 'avatar', 'frame', 'badge', 'background'
                cost INTEGER NOT NULL DEFAULT 0,
                asset_url TEXT,
                description TEXT,
                requirement TEXT, -- Description of how to earn it
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            ALTER TABLE cosmetics ADD COLUMN IF NOT EXISTS requirement TEXT;
            
            CREATE TABLE IF NOT EXISTS winner_feedback (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                draw_id INTEGER REFERENCES prize_draws(id) ON DELETE CASCADE,
                rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                is_shared BOOLEAN DEFAULT false,
                shared_platform VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS user_cosmetics (
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                cosmetic_id VARCHAR(50) REFERENCES cosmetics(id) ON DELETE CASCADE,
                is_equipped BOOLEAN DEFAULT false,
                acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, cosmetic_id)
            );

            CREATE TABLE IF NOT EXISTS user_achievements (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                achievement_key VARCHAR(50) NOT NULL, -- e.g. 'picks_25', 'streak_7'
                awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, achievement_key)
            );

            CREATE TABLE IF NOT EXISTS user_vouchers (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                draw_id INTEGER REFERENCES prize_draws(id) ON DELETE CASCADE,
                title VARCHAR(100) NOT NULL,
                description TEXT,
                claimed_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- 9. Centralized Team Logos
            CREATE TABLE IF NOT EXISTS team_logos (
                team_name VARCHAR(100) PRIMARY KEY,
                logo_url TEXT NOT NULL,
                is_verified BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- 10. Analytics (Phase 21)
            CREATE TABLE IF NOT EXISTS sponsor_analytics (
                id SERIAL PRIMARY KEY,
                sponsor_id INTEGER NOT NULL, -- Logical link to room_sponsors/applications
                event_type VARCHAR(50) NOT NULL, -- 'impression', 'click'
                room_id VARCHAR(50),
                match_id VARCHAR(50),
                user_id INTEGER REFERENCES users(id), -- Optional, for authenticated tracking
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- 11. Gamification Tables (Phase 9 & 10 Core)
            CREATE TABLE IF NOT EXISTS token_transactions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                amount INTEGER NOT NULL,
                type VARCHAR(50), -- 'daily_login', 'purchase', 'referral', 'prediction'
                description TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS badges (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                asset_url TEXT,
                requirement_type VARCHAR(50), -- 'submissions', 'wins', etc.
                requirement_value INTEGER,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS user_badges (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                badge_id INTEGER REFERENCES badges(id) ON DELETE CASCADE,
                earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, badge_id)
            );
        `;
        await client.query(schema);

        // Set your user as the SUPER ADMIN
        await client.query("UPDATE users SET permissions = '[\"super_admin\"]'::jsonb WHERE email = 'sportsprophecyapp@gmail.com'");

        // 10. Clean up any hardcoded production URLs in match logos
        await client.query(`
            UPDATE soccer_matches 
            SET home_logo = REPLACE(home_logo, 'https://www.sportsprophecyapp.com', ''),
                away_logo = REPLACE(away_logo, 'https://www.sportsprophecyapp.com', '')
            WHERE home_logo LIKE 'https://www.sportsprophecyapp.com%' 
               OR away_logo LIKE 'https://www.sportsprophecyapp.com%'
        `);

        await client.query(`
            UPDATE team_logos 
            SET logo_url = REPLACE(logo_url, 'https://www.sportsprophecyapp.com', '')
            WHERE logo_url LIKE 'https://www.sportsprophecyapp.com%'
        `);

        console.log('✅ DB Initialized: Granular permissions system is now active.');

        // 11. Sync Team Logos
        await updateDatabaseLogos();

    } catch (err) {
        console.error('❌ DB sync failed:', err);
    } finally {
        client.release();
        process.exit(0);
    }
};

initDB();
