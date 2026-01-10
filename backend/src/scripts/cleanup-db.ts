import pool from '../shared/database';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const cleanup = async () => {
    const client = await pool.connect();
    try {
        console.log('🧹 DB Cleanup: Purging all soccer matches and predictions...');

        // Optional: delete predictions if they point to mock matches
        // For a full reset, we can delete all matches.
        // matches table has foreign key in predictions.
        await client.query('DELETE FROM soccer_predictions');
        await client.query('DELETE FROM soccer_matches');

        console.log('✅ Purge complete. Table soccer_matches is now empty.');
    } catch (err) {
        console.error('❌ Cleanup failed:', err);
    } finally {
        client.release();
        process.exit(0);
    }
};

cleanup();
