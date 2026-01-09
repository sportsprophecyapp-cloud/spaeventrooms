import pool from '../shared/database';
// ... (other imports)

const runMigrations = async () => {
    const client = await pool.connect();
    try {
        console.log('Running database migrations and final setup...');

        const schema = `
            // ... (existing tables)
        `;
        await client.query(schema);

        console.log('✅ Base schema is in place.');

        // Add all missing columns
        await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by INTEGER REFERENCES users(id) ON DELETE SET NULL');
        await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0');
        // ... (other alter table statements)

        console.log('✅ All columns are present.');

        // Seed the badges table with placeholder data
        const seedBadges = `
            INSERT INTO badges (name, description, image_url) VALUES
            ('Recruiter', 'Referred 1 new user.', '/badges/recruiter.png'),
            ('Super Recruiter', 'Referred 5 new users.', '/badges/super_recruiter.png'),
            ('Elite Recruiter', 'Referred 10 new users.', '/badges/elite_recruiter.png'),
            ('Master Recruiter', 'Referred 25 new users.', '/badges/master_recruiter.png'),
            ('The Ambassador', 'Referred 50 new users. Grants free entry to all prize draws.', '/badges/ambassador.gif'),
            ('The Icon', 'Referred 100 new users. Grants custom profile image upload.', '/badges/icon.gif')
            ON CONFLICT (name) DO NOTHING;
        `;
        await client.query(seedBadges);

        console.log('✅ All recruitment badges have been seeded.');

        // ... (rest of the migration script)

    } catch (err) {
        console.error('❌ Migration and setup failed:', err);
    } finally {
        client.release();
    }
};

runMigrations();
