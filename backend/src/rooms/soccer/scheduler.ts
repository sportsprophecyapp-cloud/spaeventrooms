import { fetchLiveMatches } from '../../shared/services/footballApi';
import { resolveSoccerPredictions } from '../../shared/services/resolver';

// Very Low Frequency Data Sync - 4 Hour Interval (Savings Mode)
const ODDS_API_INTERVAL = 240 * 60 * 1000;

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
