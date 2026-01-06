import pool from '../shared/database';

const cleanup = async () => {
    const client = await pool.connect();
    try {
        console.log('Cleaning up legacy seed data...');
        await client.query(`DELETE FROM soccer_predictions WHERE match_id LIKE 'match_%'`);
        const res = await client.query(`DELETE FROM soccer_matches WHERE match_id LIKE 'match_%'`);
        console.log(`Deleted ${res.rowCount} legacy matches.`);
    } catch (err) {
        console.error('Cleanup failed:', err);
    } finally {
        client.release();
        setTimeout(() => process.exit(0), 1000);
    }
};

cleanup();
