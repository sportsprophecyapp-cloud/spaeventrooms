import { LEAGUE_NAMES } from '../shared/services/footballApi';

// Mock DB Result
const ONE_HOUR = 60 * 60 * 1000;
const LEAGUE_KEY_MAP = Object.entries(LEAGUE_NAMES).reduce((acc, [key, name]) => {
    acc[name] = key;
    return acc;
}, {} as Record<string, string>);

const mockCheckActiveLeagues = (mockRows: any[]) => {
    console.log('🔍 Checking DB for active leagues...');
    const activeLeagues: string[] = [];

    // Simulate query logic
    for (const row of mockRows) {
        // Logic: status='live' OR (status='scheduled' and near now)
        // Here we just trust the mock rows represent what the query would return
        const leagueKey = LEAGUE_KEY_MAP[row.league];
        if (leagueKey) activeLeagues.push(leagueKey);
    }
    return activeLeagues;
};

console.log('🧪 Testing Scheduler Logic...\n');

// Scenario 1: No Matches
console.log('--- Scenario 1: No Matches ---');
const res1 = mockCheckActiveLeagues([]);
console.log('Active Leagues:', res1);
if (res1.length === 0) console.log('✅ Correct: System sleeps.');
else console.error('❌ Failed');

// Scenario 2: Live Premier League Match
console.log('\n--- Scenario 2: Live Premier League Match ---');
const res2 = mockCheckActiveLeagues([{ league: 'Premier League', status: 'live' }]);
console.log('Active Leagues:', res2);
if (res2.includes('soccer_epl')) console.log('✅ Correct: Polls EPL.');
else console.error('❌ Failed');

// Scenario 3: Multiple Matches (La Liga + MLS)
console.log('\n--- Scenario 3: Multiple Matches ---');
const res3 = mockCheckActiveLeagues([
    { league: 'La Liga', status: 'live' },
    { league: 'MLS', status: 'scheduled' } // implied in-window
]);
console.log('Active Leagues:', res3);
if (res3.includes('soccer_spain_la_liga') && res3.includes('soccer_usa_mls')) console.log('✅ Correct: Polls La Liga & MLS.');
else console.error('❌ Failed');
