import pool from '../shared/database';
import fs from 'fs';
import path from 'path';

const runMigrations = async () => {
    const client = await pool.connect();
    try {
        console.log('Running migrations...');

        // Core & Phase 3 Schema
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

            CREATE TABLE IF NOT EXISTS user_vouchers (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                claimed_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS chat_filter_words (
                id SERIAL PRIMARY KEY,
                word VARCHAR(255) UNIQUE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;

        await client.query(schema);

        // Add columns if they don't exist
        await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false');
        await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_muted BOOLEAN DEFAULT false');

        console.log('Schema applied successfully.');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        client.release();
    }
};

// Only run migrations if this script is executed directly
if (require.main === module) {
    runMigrations().then(() => {
        console.log('Migration script finished.');
        process.exit();
    });
}
