import { fetchLiveMatches } from '../shared/services/footballApi';
import pool from '../shared/database';

const run = async () => {
    try {
        console.log('Testing Soccer Data Fetching...');
        await fetchLiveMatches();
        console.log('Test complete.');
    } catch (err) {
        console.error('Test failed:', err);
    } finally {
        // Need to close pool
        // But pool.end() might hang if connections are open?
        // pool from database index usually handles it.
        // Actually best to just exit process after short delay
        setTimeout(() => process.exit(0), 1000);
    }
};

run();
