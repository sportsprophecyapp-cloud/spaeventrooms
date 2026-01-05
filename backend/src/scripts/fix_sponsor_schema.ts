import pool from '../shared/database';

const fixSchema = async () => {
    const client = await pool.connect();
    try {
        console.log('🔧 Fixing Sponsor Schema...');

        // 1. Drop Tables
        console.log('🗑️ Dropping stale tables...');
        await client.query('DROP TABLE IF EXISTS sponsor_placements CASCADE');
        await client.query('DROP TABLE IF EXISTS sponsor_subscriptions CASCADE');
        await client.query('DROP TABLE IF EXISTS room_sponsors CASCADE');

        // 2. Re-create Tables
        console.log('🏗️ Re-creating tables...');

        await client.query(`
            CREATE TABLE IF NOT EXISTS room_sponsors (
                id SERIAL PRIMARY KEY,
                room_id VARCHAR(50) REFERENCES rooms(room_id),
                name VARCHAR(100) NOT NULL,
                logo_url TEXT,
                link_url TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS sponsor_subscriptions (
                id SERIAL PRIMARY KEY,
                sponsor_id INTEGER REFERENCES room_sponsors(id) ON DELETE CASCADE,
                tier VARCHAR(50) NOT NULL,
                stripe_subscription_id VARCHAR(255),
                stripe_customer_id VARCHAR(255),
                status VARCHAR(50) DEFAULT 'active',
                started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS sponsor_placements (
                id SERIAL PRIMARY KEY,
                sponsor_id INTEGER REFERENCES room_sponsors(id) ON DELETE CASCADE,
                placement_type VARCHAR(50) NOT NULL,
                page VARCHAR(100) NOT NULL,
                position INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 3. Seed Data
        console.log('🌱 Seeding Sponsor Data...');

        // Insert Sponsor
        const sponsorRes = await client.query(`
            INSERT INTO room_sponsors (room_id, name, logo_url, link_url, is_active)
            VALUES ('soccer', 'CloudBet', 'https://placehold.co/100x40/222/999?text=CloudBet', 'https://example.com', true)
            RETURNING id;
        `);
        const sponsorId = sponsorRes.rows[0].id;
        console.log('Created Sponsor:', sponsorId);

        // Insert Subscription
        await client.query(`
            INSERT INTO sponsor_subscriptions (sponsor_id, tier, status, expires_at)
            VALUES ($1, 'Growth', 'active', NOW() + INTERVAL '30 days')
        `, [sponsorId]);
        console.log('Created Subscription');

        // Insert Placement (Login)
        await client.query(`
            INSERT INTO sponsor_placements (sponsor_id, placement_type, page, position, is_active)
            VALUES ($1, 'footer', 'login', 1, true)
        `, [sponsorId]);
        console.log('Created Login Placement');

        console.log('✅ Schema Fix & Seed Complete!');

    } catch (err) {
        console.error('❌ Fix Failed:', err);
    } finally {
        client.release();
        process.exit(0);
    }
};

fixSchema();
