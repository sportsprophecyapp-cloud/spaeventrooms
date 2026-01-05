import pool from '../shared/database';

const seedSponsors = async () => {
    const client = await pool.connect();
    try {
        console.log('🌱 Seeding Sponsor Data...');

        // 1. Insert Sponsor
        const sponsorRes = await client.query(`
            INSERT INTO room_sponsors (room_id, name, logo_url, link_url, is_active)
            VALUES ('soccer', 'CloudBet', 'https://placehold.co/100x40/222/999?text=CloudBet', 'https://example.com', true)
            RETURNING id;
        `);
        const sponsorId = sponsorRes.rows[0].id;
        console.log('Created Sponsor:', sponsorId);

        // 2. Insert Subscription
        await client.query(`
            INSERT INTO sponsor_subscriptions (sponsor_id, tier, status, expires_at)
            VALUES ($1, 'Growth', 'active', NOW() + INTERVAL '30 days')
        `, [sponsorId]);
        console.log('Created Subscription');

        // 3. Insert Placement (Login)
        await client.query(`
            INSERT INTO sponsor_placements (sponsor_id, placement_type, page, position, is_active)
            VALUES ($1, 'footer', 'login', 1, true)
        `, [sponsorId]);
        console.log('Created Login Placement');

    } catch (err) {
        console.error('❌ Seeding Failed:', err);
    } finally {
        client.release();
        process.exit(0);
    }
};

seedSponsors();
