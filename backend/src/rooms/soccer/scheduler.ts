import { fetchLiveMatches } from '../../shared/services/footballApi';
import { resolveSoccerPredictions } from '../../shared/services/resolver';

// Interval for syncing data - using 45 minutes to be safe with limits
const ODDS_API_INTERVAL = 45 * 60 * 1000;

export const startSoccerScheduler = () => {
    console.log('🎯 Arena Data Scheduler: Standard Mode (45m Interval)');

    const initialRun = async () => {
        console.log('🚀 Performing initial Arena sync...');
        await fetchLiveMatches().catch(e => { });
        await resolveSoccerPredictions().catch(e => { });
    };
    initialRun();

    // Standard-Frequency Markets
    setInterval(async () => {
        console.log('📡 [Scheduler] Syncing markets and resolving predictions...');
        await fetchLiveMatches().catch(e => { });
        await resolveSoccerPredictions().catch(e => { });
    }, ODDS_API_INTERVAL);
};
