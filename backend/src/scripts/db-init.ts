import pool from '../shared/database';

const initDB = async () => {
    const client = await pool.connect();
    try {
        console.log('🚀 Starting Definitive Sandbox Database Initialization (v3.6 - Multi-Field App Sync)...');

        const schema = `
            -- 1. Create Application Table with ALL strategy fields
            CREATE TABLE IF NOT EXISTS sponsor_applications (
                id SERIAL PRIMARY KEY,
                brand_name VARCHAR(255) NOT NULL,
                contact_email VARCHAR(255) NOT NULL,
                website_url TEXT,
                arena_target VARCHAR(50) DEFAULT 'soccer',
                frequency VARCHAR(50) DEFAULT 'monthly',
                prize_quantity INTEGER DEFAULT 1,
                prize_description TEXT NOT NULL,
                logo_url TEXT, -- Store sandbox base64 or link
                prize_image_url TEXT,
                agreed_to_terms BOOLEAN DEFAULT FALSE,
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            -- 2. Add legal tracking to existing sponsors table
            ALTER TABLE room_sponsors ADD COLUMN IF NOT EXISTS prize_escrow_received BOOLEAN DEFAULT FALSE;
            ALTER TABLE room_sponsors ADD COLUMN IF NOT EXISTS legal_agreement_signed BOOLEAN DEFAULT FALSE;
            ALTER TABLE room_sponsors ADD COLUMN IF NOT EXISTS signed_at TIMESTAMP WITH TIME ZONE;
        `;
        await client.query(schema);

        console.log('✅ DB Initialized: Database now perfectly matches the Sponsor Sandbox form.');
    } catch (err) {
        console.error('❌ DB Economy sync failed:', err);
    } finally {
        client.release();
        process.exit(0);
    }
};

initDB();
