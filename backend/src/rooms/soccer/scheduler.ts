import { fetchLiveMatches } from '../../shared/services/footballApi';
import { fetchApiFootballMatches } from '../../shared/services/apiFootball';
import { resolveSoccerPredictions } from '../../shared/services/resolver';

// CONSERVATIVE STRATEGY: Stay 25% under free-tier limits to allow for manual refreshes
const ODDS_API_INTERVAL = 45 * 60 * 1000;    // 45 Minutes (32/day = ~960/mo) - Safe for 2,000 limit
const FOOTBALL_API_INTERVAL = 20 * 60 * 1000; // 20 Minutes (72/day) - Safe for 100 limit

export const startSoccerScheduler = () => {
    console.log('🎯 Arena Data Scheduler: SAFETY-BUFFER MODE (20m / 45m Intervals)');

    const initialRun = async () => {
        console.log('🚀 Performing initial Arena sync...');
        await fetchLiveMatches().catch(e => {});
        await fetchApiFootballMatches().catch(e => {});
        await resolveSoccerPredictions().catch(e => {});
    };
    initialRun();

    // High-Frequency Scores (Every 20 Minutes)
    setInterval(async () => {
        console.log('📡 [Safety-Freq] API-Football: Syncing scores...');
        await fetchApiFootballMatches().catch(e => {});
        await resolveSoccerPredictions().catch(e => {});
    }, FOOTBALL_API_INTERVAL);

    // Standard-Frequency Markets (Every 45 Minutes)
    setInterval(async () => {
        console.log('📡 [Safety-Freq] The Odds API: Syncing markets...');
        await fetchLiveMatches().catch(e => {});
    }, ODDS_API_INTERVAL);
};
