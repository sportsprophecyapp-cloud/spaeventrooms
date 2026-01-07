import pool from '../shared/database';

const initDB = async () => {
    const client = await pool.connect();
    try {
        console.log('🚀 Starting Legal-Protection Database Initialization (v3.5 - Sponsor Escrow)...');

        const schema = `
            -- 1. Add legal tracking to sponsors
            ALTER TABLE room_sponsors ADD COLUMN IF NOT EXISTS prize_escrow_received BOOLEAN DEFAULT FALSE;
            ALTER TABLE room_sponsors ADD COLUMN IF NOT EXISTS legal_agreement_signed BOOLEAN DEFAULT FALSE;
            ALTER TABLE room_sponsors ADD COLUMN IF NOT EXISTS signed_at TIMESTAMP WITH TIME ZONE;
            ALTER TABLE room_sponsors ADD COLUMN IF NOT EXISTS sponsor_email VARCHAR(255);

            -- 2. Create Application Table
            CREATE TABLE IF NOT EXISTS sponsor_applications (
                id SERIAL PRIMARY KEY,
                brand_name VARCHAR(255) NOT NULL,
                contact_email VARCHAR(255) NOT NULL,
                prize_description TEXT NOT NULL,
                website_url TEXT,
                status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
                agreed_to_terms BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await client.query(schema);

        console.log('✅ DB Initialized: Legal protection and application tracking active.');
    } catch (err) {
        console.error('❌ DB Economy sync failed:', err);
    } finally {
        client.release();
        process.exit(0);
    }
};

initDB();
