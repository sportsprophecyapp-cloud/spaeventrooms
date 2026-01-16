import { fetchLiveMatches } from '../../shared/services/footballApi';
import { resolveSoccerPredictions } from '../../shared/services/resolver';

// Standard Frequency Data Sync - 1 Hour Interval
const ODDS_API_INTERVAL = 60 * 60 * 1000;

export const startSoccerScheduler = () => {
    console.log('🎯 Arena Data Scheduler: Savings Mode (4h Interval)');

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
