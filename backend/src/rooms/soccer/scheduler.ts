import { fetchLiveMatches } from '../../shared/services/footballApi';
import { resolveSoccerPredictions } from '../../shared/services/resolver';

// Standard Frequency Data Sync - 1 Hour Interval
const ODDS_API_INTERVAL = 60 * 60 * 1000;

const isMatchWindow = (): boolean => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sun, 6 = Sat
    const hour = now.getHours(); // 0-23

    // Weekends (Sat/Sun): Active 12 PM - 11 PM
    const isWeekend = day === 0 || day === 6;
    if (isWeekend && hour >= 12 && hour <= 23) return true;

    // Weekdays: Active 6 PM - 11 PM (Champions League/Mid-week games)
    if (!isWeekend && hour >= 18 && hour <= 23) return true;

    return false;
};

export const startSoccerScheduler = () => {
    console.log('🎯 Arena Data Scheduler: Smart Mode (1h Interval, Peak Hours Only)');

    // Initial run only if in window to avoid wasting start-up credits
    const initialRun = async () => {
        if (isMatchWindow()) {
            console.log('🚀 Performing initial Arena sync (In Match Window)...');
            await fetchLiveMatches().catch(e => { });
            await resolveSoccerPredictions().catch(e => { });
        } else {
            console.log('💤 Initial sync skipped (Outside Match Window). Next check in 1h.');
        }
    };
    initialRun();

    // Standard-Frequency Markets
    setInterval(async () => {
        if (!isMatchWindow()) {
            console.log('💤 [Smart Scheduler] Skipping sync (Outside active match window). Saving API credits.');
            return;
        }

        console.log('📡 [Scheduler] Syncing markets and resolving predictions...');
        await fetchLiveMatches().catch(e => { });
        await resolveSoccerPredictions().catch(e => { });
    }, ODDS_API_INTERVAL);
};
