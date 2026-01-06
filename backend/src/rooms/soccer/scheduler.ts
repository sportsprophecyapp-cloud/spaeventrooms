import { fetchLiveMatches } from '../../shared/services/footballApi';

/**
 * SMART SCHEDULER
 * To stay within "The Odds API" free tier (500 requests/month):
 * - Fetching every 2 hours = 12 times a day.
 * - 12 times * 30 days = 360 requests.
 * - This stays SAFELY under the 500 limit even with 1 API key.
 */
const NORMAL_INTERVAL = 2 * 60 * 60 * 1000; // 2 Hours

export const startSoccerScheduler = () => {
    console.log('⚽️ Soccer Data Scheduler started. Mode: Quota-Friendly (2h interval)');

    // Initial fetch on server start
    fetchLiveMatches().catch(err => console.error('Initial soccer fetch failed:', err));

    setInterval(() => {
        const hour = new Date().getHours();
        
        // Optional: You could add logic here to fetch more often during "Peak" match hours
        // for now, we stay consistent at 2 hours to protect the budget.
        console.log('⚽️ Scheduled fetch: Updating soccer matches in database...');
        fetchLiveMatches().catch(err => console.error('Scheduled soccer fetch failed:', err));
    }, NORMAL_INTERVAL);
};
