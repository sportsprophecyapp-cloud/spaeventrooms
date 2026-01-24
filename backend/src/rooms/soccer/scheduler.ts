import { fetchLiveMatches, LEAGUE_NAMES } from '../../shared/services/footballApi';
import { resolveSoccerPredictions } from '../../shared/services/resolver';
import { query } from '../../shared/database';

// Reduced Frequency - 1.5 Hours (to conserve API quota while maintaining accuracy)
let CHECK_INTERVAL = 1.5 * 60 * 60 * 1000;

// QUOTA-BASED DYNAMIC POLLING
const updateIntervalBasedOnQuota = (remaining: number) => {
    if (remaining < 100 && CHECK_INTERVAL < 3 * 60 * 60 * 1000) {
        console.warn(`🐢 Low API Quota (${remaining}). Slowing down polling to 3 hours.`);
        CHECK_INTERVAL = 3 * 60 * 60 * 1000;
    } else if (remaining > 200 && CHECK_INTERVAL > 1.5 * 60 * 60 * 1000) {
        console.log(`🚀 Quota Healthy (${remaining}). Restoring polling to 1.5 hours.`);
        CHECK_INTERVAL = 1.5 * 60 * 60 * 1000;
    }
};

// Reverse Map: "Premier League" -> "soccer_epl"
const LEAGUE_KEY_MAP = Object.entries(LEAGUE_NAMES).reduce((acc, [key, name]) => {
    acc[name] = key;
    return acc;
}, {} as Record<string, string>);

const checkActiveLeagues = async (): Promise<string[]> => {
    try {
        // Find leagues with matches that are:
        // 1. Currently 'live'
        // 2. OR 'finished' within the last 4 hours (to capture final scores)
        // 3. OR 'scheduled' to start within the next 1 hour
        const result = await query(`
            SELECT DISTINCT league 
            FROM soccer_matches 
            WHERE status = 'live' 
            OR (status = 'finished' AND updated_at > NOW() - INTERVAL '4 hours')
            OR (status = 'scheduled' AND start_time > NOW() AND start_time < NOW() + INTERVAL '1 hour')
        `);

        if (result.rowCount === 0) return [];

        const activeLeagues: string[] = [];
        for (const row of result.rows) {
            const leagueKey = LEAGUE_KEY_MAP[row.league];
            if (leagueKey) activeLeagues.push(leagueKey);
        }
        return activeLeagues;
    } catch (e) {
        console.error('❌ Scheduler DB Check failed:', e);
        return [];
    }
};

const runSchedulerCycle = async () => {
    const now = new Date();
    const hour = now.getHours();

    // --- A. THE HEARTBEAT (Once a day at 4 AM) ---
    if (hour === 4) {
        console.log('💓 [Heartbeat] Daily Schedule Sync (All Leagues)...');
        const quota = await fetchLiveMatches().catch(e => 0);
        if (typeof quota === 'number') updateIntervalBasedOnQuota(quota);
        await resolveSoccerPredictions().catch(e => { });
        return;
    }

    // --- B. TARGETED POLLING ---
    const activeLeagues = await checkActiveLeagues();

    if (activeLeagues.length > 0) {
        console.log(`🎯 [Targeted Poll] Active Leagues: ${activeLeagues.join(', ')}`);
        const quota = await fetchLiveMatches(activeLeagues).catch(e => 0);
        if (typeof quota === 'number') updateIntervalBasedOnQuota(quota);
        await resolveSoccerPredictions().catch(e => { });
    } else {
        console.log('💤 [Sleep] No active matches. Conserving API quota.');
        await resolveSoccerPredictions().catch(e => { });
    }
};

export const startSoccerScheduler = () => {
    console.log('🎯 Arena Data Scheduler: Optimized Mode (1.5-hour interval)');

    const initialSync = async () => {
        const countRes = await query('SELECT count(*) FROM soccer_matches');
        const count = parseInt(countRes.rows[0].count);

        if (count === 0) {
            console.log('🚀 DB Empty: Performing full initial schedule sync...');
            const quota = await fetchLiveMatches().catch(e => 0);
            if (typeof quota === 'number') updateIntervalBasedOnQuota(quota);
        } else {
            console.log(`ℹ️ DB has ${count} matches. Skipping startup sync.`);
            await runSchedulerCycle();
        }
    };
    initialSync();

    // 2. Main Loop (Supports dynamic intervals)
    const scheduleNext = () => {
        setTimeout(async () => {
            await runSchedulerCycle();
            scheduleNext();
        }, CHECK_INTERVAL);
    };
    scheduleNext();
};
