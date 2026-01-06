import { fetchLiveMatches } from '../../shared/services/footballApi';

// Run every 30 minutes
const INTERVAL = 30 * 60 * 1000;

export const startSoccerScheduler = () => {
    console.log('⚽️ Soccer Data Scheduler started. Fetching every 30 minutes.');

    // Run immediately on start
    fetchLiveMatches().catch(err => console.error('Initial soccer fetch failed:', err));

    setInterval(() => {
        console.log('⚽️ Scheduled fetch: Updating soccer matches...');
        fetchLiveMatches().catch(err => console.error('Scheduled soccer fetch failed:', err));
    }, INTERVAL);
};
