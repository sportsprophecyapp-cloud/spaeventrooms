import { fetchLiveMatches, LEAGUE_NAMES } from '../../shared/services/footballApi';
import { resolveSoccerPredictions } from '../../shared/services/resolver';
import { query } from '../../shared/database';

// Conservative Frequency - 4 Hours (to conserve API quota until user base grows)
const CHECK_INTERVAL = 4 * 60 * 60 * 1000;

// Reverse Map: "Premier League" -> "soccer_epl"
const LEAGUE_KEY_MAP = Object.entries(LEAGUE_NAMES).reduce((acc, [key, name]) => {
    acc[name] = key;
    return acc;
}, {} as Record<string, string>);

const checkActiveLeagues = async (): Promise<string[]> => {
    try {
        // Find leagues with matches that are:
        // 1. Currently 'live'
        // 2. OR 'scheduled' to start within the next 2 hours or started in the last 3 hours
        const result = await query(`
            SELECT DISTINCT league 
            FROM soccer_matches 
            WHERE status = 'live' 
            OR (status != 'finished' AND start_time > NOW() - INTERVAL '3 hours' AND start_time < NOW() + INTERVAL '2 hours')
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
    // This ensures upcoming schedules are refreshed daily
    if (hour === 4) {
        console.log('💓 [Heartbeat] Daily Schedule Sync (All Leagues)...');
        await fetchLiveMatches().catch(e => { }); // No args = fetch all
        await resolveSoccerPredictions().catch(e => { });
        return;
    }

    // --- B. TARGETED POLLING ---
    // Query DB to see what is actually happening
    const activeLeagues = await checkActiveLeagues();

    if (activeLeagues.length > 0) {
        console.log(`🎯 [Targeted Poll] Active Leagues: ${activeLeagues.join(', ')}`);
        await fetchLiveMatches(activeLeagues).catch(e => { });
        await resolveSoccerPredictions().catch(e => { });
    } else {
        console.log('💤 [Sleep] No active matches. Conserving API quota.');
        // Still run resolver in case there are any to clear
        await resolveSoccerPredictions().catch(e => { });
    }
};

export const startSoccerScheduler = () => {
    console.log('🎯 Arena Data Scheduler: Conservative Mode (4-hour interval)');

    // 1. Initial Heartbeat Force Sync (On Startup)
    // We only do this lightly to ensure we have SOME schedule data if DB is empty
    const initialSync = async () => {
        const countRes = await query('SELECT count(*) FROM soccer_matches');
        const count = parseInt(countRes.rows[0].count);

        if (count === 0) {
            console.log('🚀 DB Empty: Performing full initial schedule sync...');
            await fetchLiveMatches().catch(e => { });
        } else {
            console.log(`ℹ️ DB has ${count} matches. Skipping full startup sync to save credits.`);
            // Run the targeted cycle immediately to catch up on pending games
            console.log('⚡ Startup: Running immediate check for pending games...');
            await runSchedulerCycle();
        }
    };
    initialSync();

    // 2. Main Loop (Runs every 4 hours to conserve API quota)
    setInterval(runSchedulerCycle, CHECK_INTERVAL);
};
