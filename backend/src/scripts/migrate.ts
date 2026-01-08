import pool from '../shared/database';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const runMigrations = async () => {
    const client = await pool.connect();
    try {
        console.log('Running database migrations and final setup...');

        const schema = `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                username VARCHAR(50) UNIQUE,
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

        // Add all missing columns to users table
        await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT \'["supporter"]\'::jsonb');
        await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false');
        await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_muted BOOLEAN DEFAULT false');
        await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0');
        await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS token_balance INTEGER DEFAULT 150');
        await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 1');

        // Add all missing columns to soccer_predictions table
        await client.query('ALTER TABLE soccer_predictions ADD COLUMN IF NOT EXISTS result VARCHAR(50)');
        await client.query('ALTER TABLE soccer_predictions ADD COLUMN IF NOT EXISTS points_earned INTEGER');

        console.log('✅ Base schema and columns are now in place.');

        // Ensure the admin user exists and reset password to a known state
        const adminEmail = 'sportsprophecyapp@gmail.com';
        const adminPassword = 'your_password_here'; // Replace with your actual password

        if (adminPassword === 'your_password_here') {
            console.error('❌ FATAL: You must edit the migrate.ts script to include the admin password before deploying.');
            throw new Error('Admin password not set in migration script.');
        }

        const userCheck = await client.query('SELECT * FROM users WHERE email = $1', [adminEmail]);
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        if (userCheck.rowCount === 0) {
            console.log(`Admin user not found. Creating user '${adminEmail}'...`);
            await client.query('INSERT INTO users(email, username, password_hash, permissions) VALUES ($1, $2, $3, $4)', [adminEmail, 'admin', hashedPassword, '["super_admin"]']);
        } else {
            console.log(`Admin user found. Updating password and permissions for '${adminEmail}'...`);
            await client.query('UPDATE users SET password_hash = $1, permissions = $2 WHERE email = $3', [hashedPassword, '["super_admin"]', adminEmail]);
        }
        
        console.log('✅ Admin user is configured correctly.');

    } catch (err) {
        console.error('❌ Migration and setup failed:', err);
    } finally {
        client.release();
    }
};

runMigrations();
