import { fetchLiveMatches } from '../../shared/services/footballApi';
import { fetchApiFootballMatches } from '../../shared/services/apiFootball';
import { resolveSoccerPredictions } from '../../shared/services/resolver';

// Strategy: Maximize frequency while staying under API quotas
const ODDS_API_INTERVAL = 30 * 60 * 1000;    // 30 Minutes (48/day)
const FOOTBALL_API_INTERVAL = 15 * 60 * 1000; // 15 Minutes (96/day)

export const startSoccerScheduler = () => {
    console.log('🎯 Arena Data Scheduler: HIGH-SPEED MODE (15m / 30m Dual-Interval)');

    // 1. Immediate Initial Sync
    const initialRun = async () => {
        console.log('🚀 Performing initial Arena sync...');
        await fetchLiveMatches().catch(e => {});
        await fetchApiFootballMatches().catch(e => {});
        await resolveSoccerPredictions().catch(e => {});
    };
    initialRun();

    // 2. High-Frequency: API-Football (Every 15 Minutes)
    setInterval(async () => {
        console.log('📡 [High-Freq] API-Football: Refreshing scores...');
        await fetchApiFootballMatches().catch(e => {});
        
        // Resolve predictions after every score update
        await resolveSoccerPredictions().catch(e => {});
    }, FOOTBALL_API_INTERVAL);

    // 3. Standard-Frequency: The Odds API (Every 30 Minutes)
    setInterval(async () => {
        console.log('📡 [Std-Freq] The Odds API: Syncing markets...');
        await fetchLiveMatches().catch(e => {});
    }, ODDS_API_INTERVAL);
};
