import pool from '../shared/database';

const seedData = async () => {
    const client = await pool.connect();
    try {
        console.log('Seeding initial data...');

        // 1. Seed Rooms
        await client.query(`
            INSERT INTO rooms (room_id, display_name)
            VALUES ('soccer', 'Pro Soccer')
            ON CONFLICT (room_id) DO NOTHING;
        `);

        // 2. Soccer Matches (REMOVED - ONLY LIVE DATA ALLOWED)
        console.log('Skipping match seeding (Pure Live Mode enabled)');

        // 3. Seed Sample Announcement
        await client.query(`
            INSERT INTO announcements (room_id, type, title, description, is_draft, published_at)
            VALUES ('soccer', 'live', 'Welcome to Phase 3!', 'Real-time announcements are now live. Check out the Admin Panel to post your own!', false, CURRENT_TIMESTAMP)
            ON CONFLICT DO NOTHING;
        `);

        console.log('Seeding completed successfully.');
    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        client.release();
        process.exit();
    }
};

seedData();
