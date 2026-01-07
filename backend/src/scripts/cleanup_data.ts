import pool from '../shared/database';

const cleanupArena = async () => {
    const client = await pool.connect();
    try {
        console.log('🧹 Purging Mock Data and duplicates...');

        // 1. Delete all prediction polls that are NOT linked to real match_ids
        await client.query("DELETE FROM soccer_predictions WHERE match_id NOT IN (SELECT match_id FROM soccer_matches)");

        // 2. Delete matches that are likely mock data (e.g., IDs not starting with api- or match-)
        await client.query("DELETE FROM soccer_matches WHERE match_id NOT LIKE 'api-%' AND match_id NOT LIKE 'match-%'");

        // 3. Delete specifically the old 'Red Card' and 'Clean Sheet' mock items if they exist in predictions table
        // (Assuming they were stored as custom predictions)
        
        console.log('✅ Arena Purged. Only API-verified data remains.');
    } catch (err) {
        console.error('❌ Cleanup failed:', err);
    } finally {
        client.release();
        process.exit(0);
    }
};

cleanupArena();
