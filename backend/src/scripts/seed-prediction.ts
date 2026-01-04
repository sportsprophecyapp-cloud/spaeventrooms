
import pool from '../shared/database';

const seedPrediction = async () => {
    try {
        console.log('🌱 Seeding Custom Prediction...');
        const client = await pool.connect();

        await client.query(`
            INSERT INTO custom_predictions (room_id, question, options, created_by)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT DO NOTHING
        `, ['soccer', 'Who will win the Golden Boot?', JSON.stringify(['Salah', 'Haaland', 'Saka', 'Nuñez']), 1]);

        console.log('✅ Custom Prediction seeded.');
        client.release();
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to seed prediction:', err);
        process.exit(1);
    }
};

seedPrediction();
