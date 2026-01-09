import pool from '../shared/database';

const seedDraws = async () => {
    const client = await pool.connect();
    try {
        console.log('🌱 Seeding Prize Draws...');

        const query = `
            INSERT INTO prize_draws (title, prize, description, room_id, status)
            VALUES 
            ('Soccer Weekly Jackpot', '$100 Amazon Voucher', 'Sponsored by MegaBet - Predict 10 matches correctly to enter!', 'soccer', 'active'),
            ('NFL Playoff Special', 'Authentic NFL Jersey', 'Sponsored by Fanatics - Daily entries for active predictors.', 'soccer', 'active')
            ON CONFLICT DO NOTHING;
        `;

        await client.query(query);
        console.log('✅ Prize Draws seeded successfully.');
    } catch (err) {
        console.error('❌ Seeding failed:', err);
    } finally {
        client.release();
        process.exit(0);
    }
};

seedDraws();
