import pool from '../shared/database/postgres';

const cleanup = async () => {
    const client = await pool.connect();
    try {
        console.log('🧹 Starting Sponsor Cleanup...');

        // 1. Delete orphans (Room Sponsors with no matching Application)
        // Note: We check if application_id is set but the ID doesn't exist in applications table
        const res = await client.query(`
            DELETE FROM room_sponsors 
            WHERE application_id IS NOT NULL 
            AND application_id NOT IN (SELECT id FROM sponsor_applications)
        `);
        console.log(`✅ Deleted ${res.rowCount} orphaned live placements.`);

        // 2. Ensuring all remaining sponsors have is_active = true if null
        await client.query(`
            UPDATE room_sponsors SET is_active = true WHERE is_active IS NULL
        `);
        console.log('✅ Ensured validity of remaining records.');

    } catch (err) {
        console.error('❌ Cleanup failed:', err);
    } finally {
        client.release();
        process.exit(0);
    }
};

cleanup();
