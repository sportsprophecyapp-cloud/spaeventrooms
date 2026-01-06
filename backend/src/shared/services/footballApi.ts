import axios from 'axios';
import { query } from '../database';

// Default leagues to fetch: EPL, La Liga, Bundesliga, Serie A, Ligue 1, MLS
// IDs are typically: 39 (EPL), 140 (La Liga), 78 (Bundesliga), 135 (Serie A), 61 (Ligue 1), 253 (MLS)
// We will fetch a broader range or specific ones as needed.
const LEAGUE_IDS = [39, 140, 78, 135, 61, 253];

const API_KEY = process.env.API_FOOTBALL_KEY || 'PLACEHOLDER_KEY_NEEDED';
const API_HOST = 'v3.football.api-sports.io';
const API_URL = 'https://v3.football.api-sports.io';

export interface MatchData {
    fixture: {
        id: number;
        date: string;
        status: {
            short: string; // "NS", "FT", "1H", etc.
        }
    };
    league: {
        name: string;
        logo: string;
    };
    teams: {
        home: { name: string; winner: boolean | null };
        away: { name: string; winner: boolean | null };
    };
    goals: {
        home: number | null;
        away: number | null;
    };
}

export const fetchLiveMatches = async () => {
    if (API_KEY === 'PLACEHOLDER_KEY_NEEDED') {
        console.warn('⚠️ API_FOOTBALL_KEY is missing. Using mock data for demonstration.');
        return fetchMockData();
    }

    try {
        // Fetch matches for today
        // Note: Free tier is 100 req/day. We should cache or limit frequency.
        // We will request "current" matches or matches for today.

        // Simple strategy: Fetch all matches for today for selected leagues
        const today = new Date().toISOString().split('T')[0];

        // We might need to iterate if we want specific leagues, or just fetch "date=today" for all
        // Let's try fetching by date for now to save requests.
        const response = await axios.get(`${API_URL}/fixtures`, {
            params: {
                date: today
                // league: ... we can filter by league if needed, but asking for all might be too much data
                // better to maybe make one call per relevant league? Or just get *everything* and filter?
                // API-Football allows filtering by league. comma separated? No.
            },
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': API_HOST
            }
        });

        // Filter for our target leagues client-side if we fetch broad, 
        // OR we loop. Looping 6 times is fine for a cron job running every 30 mins.
        // But for "live", fetching by date is usually one call.
        // Let's assume we want major leagues.

        let allMatches: any[] = [];

        // Parallel requests for our top leagues
        const requests = LEAGUE_IDS.map(leagueId =>
            axios.get(`${API_URL}/fixtures`, {
                params: {
                    date: today,
                    league: leagueId,
                    season: new Date().getFullYear() // simplified season logic
                },
                headers: {
                    'x-rapidapi-key': API_KEY,
                    'x-rapidapi-host': API_HOST
                }
            }).catch(err => {
                console.error(`Failed to fetch league ${leagueId}:`, err.message);
                return { data: { response: [] } };
            })
        );

        const results = await Promise.all(requests);
        results.forEach(res => {
            if (res.data && res.data.response) {
                allMatches = [...allMatches, ...res.data.response];
            }
        });

        console.log(`Fetched ${allMatches.length} matches from API.`);
        return syncMatchesToDB(allMatches);

    } catch (error) {
        console.error('Error fetching matches:', error);
        throw error;
    }
};

const syncMatchesToDB = async (matches: any[]) => {
    const client = await query('BEGIN');
    // Wait, query is a wrapper. We usually just use query.
    // If we want transaction:
    // This wrapper in `database/index.ts` usually just executes.
    // Let's just create a loop for now. UPSERT is safe.

    let count = 0;
    for (const m of matches) {
        const { fixture, league, teams, goals } = m;

        // Map status
        let status = 'scheduled';
        if (['1H', '2H', 'HT', 'ET', 'P', 'LIVE'].includes(fixture.status.short)) status = 'live';
        if (['FT', 'AET', 'PEN'].includes(fixture.status.short)) status = 'finished';

        await query(`
            INSERT INTO soccer_matches (
                match_id, home_team, away_team, start_time, status, 
                league, league_logo, score_home, score_away, data
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (match_id) DO UPDATE SET 
                status = EXCLUDED.status,
                score_home = EXCLUDED.score_home,
                score_away = EXCLUDED.score_away,
                data = EXCLUDED.data
        `, [
            String(fixture.id),
            teams.home.name,
            teams.away.name,
            fixture.date,
            status,
            league.name,
            league.logo,
            goals.home || 0,
            goals.away || 0,
            JSON.stringify(m)
        ]);
        count++;
    }
    console.log(`Upserted ${count} matches.`);
};

// Mock data generator for when no key is present
const fetchMockData = async () => {
    console.log('Generating mock soccer data...');
    const now = new Date();

    const mockMatches = [
        {
            fixture: { id: 1001, date: new Date(now.getTime() + 3600000).toISOString(), status: { short: 'NS' } }, // +1h
            league: { name: 'Premier League', logo: 'https://media.api-sports.io/football/leagues/39.png' },
            teams: { home: { name: 'Arsenal' }, away: { name: 'Liverpool' } },
            goals: { home: null, away: null }
        },
        {
            fixture: { id: 1002, date: new Date(now.getTime() - 1800000).toISOString(), status: { short: '1H' } }, // Live (started 30m ago)
            league: { name: 'Demo League', logo: 'https://media.api-sports.io/football/leagues/140.png' },
            teams: { home: { name: 'Real Madrid' }, away: { name: 'Barcelona' } },
            goals: { home: 1, away: 0 }
        },
        {
            fixture: { id: 1003, date: new Date(now.getTime() + 7200000).toISOString(), status: { short: 'NS' } }, // +2h
            league: { name: 'Bundesliga', logo: 'https://media.api-sports.io/football/leagues/78.png' },
            teams: { home: { name: 'Bayern Munich' }, away: { name: 'Dortmund' } },
            goals: { home: null, away: null }
        }
    ];

    await syncMatchesToDB(mockMatches);
};
