import pool from '../shared/database';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const runMigrations = async () => {
    const client = await pool.connect();
    try {
        console.log('Running database migrations and final setup...');

        const schema = `
            // ... (existing CREATE TABLE statements remain the same) ...

            CREATE TABLE IF NOT EXISTS badges (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) UNIQUE NOT NULL,
                description TEXT NOT NULL,
                image_url VARCHAR(255) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS user_unlocked_badges (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                badge_id INTEGER NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, badge_id)
            );
        `;
        await client.query(schema);

        console.log('✅ Base schema is in place.');

        // Add all missing columns
        await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_badge_id INTEGER REFERENCES badges(id) ON DELETE SET NULL');
        // ... (other ALTER TABLE statements remain the same) ...

        console.log('✅ All columns are present.');

        // Seed the badges table with placeholder data
        const seedBadges = `
            INSERT INTO badges (name, description, image_url) VALUES
            ('Pioneer', 'Joined within the first 100 users.', '/badges/pioneer.png'),
            ('Settler', 'Joined within the first 500 users.', '/badges/settler.png'),
            ('Explorer', 'Joined within the first 1000 users.', '/badges/explorer.png'),
            ('First Prophecy', 'Make your first prediction.', '/badges/first_prophecy.png'),
            ('High Roller', 'Spend 10,000 tokens.', '/badges/high_roller.png'),
            ('Perfect Call', 'Correctly predict a match with less than 10% consensus.', '/badges/perfect_call.png')
            ON CONFLICT (name) DO NOTHING;
        `;
        await client.query(seedBadges);

        console.log('✅ Placeholder badges have been seeded.');

        // ... (rest of the migration script remains the same) ...

    } catch (err) {
        console.error('❌ Migration and setup failed:', err);
    } finally {
        client.release();
    }
};

runMigrations();
