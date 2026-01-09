import { query } from '../database';

const LEAGUE_NAMES: Record<string, string> = {
    'soccer_epl': 'Premier League',
    'soccer_spain_la_liga': 'La Liga',
    'soccer_germany_bundesliga': 'Bundesliga',
    'soccer_italy_serie_a': 'Serie A',
    'soccer_france_ligue_one': 'Ligue 1',
    'soccer_usa_mls': 'MLS'
};

const LEAGUE_LOGOS: Record<string, string> = {
    'soccer_epl': 'https://media.api-sports.io/football/leagues/39.png',
    'soccer_spain_la_liga': 'https://media.api-sports.io/football/leagues/140.png',
    'soccer_germany_bundesliga': 'https://media.api-sports.io/football/leagues/78.png',
    'soccer_italy_serie_a': 'https://media.api-sports.io/football/leagues/135.png',
    'soccer_france_ligue_one': 'https://media.api-sports.io/football/leagues/61.png',
    'soccer_usa_mls': 'https://media.api-sports.io/football/leagues/253.png'
};

const TEAMS = {
    'soccer_epl': [
        { home: 'Arsenal', away: 'Chelsea' }, { home: 'Man City', away: 'Liverpool' }, { home: 'Man Utd', away: 'Spurs' }
    ],
    'soccer_spain_la_liga': [
        { home: 'Real Madrid', away: 'Barcelona' }, { home: 'Atletico', away: 'Sevilla' }
    ],
    'soccer_germany_bundesliga': [
        { home: 'Bayern', away: 'Dortmund' }, { home: 'Leverkusen', away: 'Leipzig' }
    ],
    'soccer_italy_serie_a': [
        { home: 'Juventus', away: 'Milan' }, { home: 'Inter', away: 'Napoli' }
    ],
    'soccer_france_ligue_one': [
        { home: 'PSG', away: 'Marseille' }, { home: 'Lyon', away: 'Monaco' }
    ],
    'soccer_usa_mls': [
        { home: 'Inter Miami', away: 'LA Galaxy' }, { home: 'NYCFC', away: 'Sounders' }
    ]
};

export const injectMockMatches = async () => {
    console.log('🏟️  Injecting MOCK DATA for all leagues...');
    let count = 0;

    for (const [sportKey, leagueName] of Object.entries(LEAGUE_NAMES)) {
        const teams = TEAMS[sportKey as keyof typeof TEAMS] || [];
        const logo = LEAGUE_LOGOS[sportKey] || '';

        // 1. Live Match (Started 45 mins ago)
        if (teams[0]) {
            await insertMockMatch(`mock_live_${sportKey}`, teams[0].home, teams[0].away, new Date(Date.now() - 45 * 60000), 'live', leagueName, logo, 1, 1);
            count++;
        }

        // 2. Upcoming Match (Starts in 2 hours)
        if (teams[1]) {
            await insertMockMatch(`mock_upcoming_${sportKey}`, teams[1].home, teams[1].away, new Date(Date.now() + 120 * 60000), 'scheduled', leagueName, logo, 0, 0);
            count++;
        }

        // 3. Finished Match (Ended 3 hours ago)
        if (teams[2]) {
            await insertMockMatch(`mock_finished_${sportKey}`, teams[2].home, teams[2].away, new Date(Date.now() - 180 * 60000), 'finished', leagueName, logo, 2, 1);
            count++;
        }
    }

    console.log(`✅ Mock Data Injection Complete: ${count} matches active.`);
};

const insertMockMatch = async (
    id: string, home: string, away: string, time: Date, status: string,
    league: string, logo: string, homeScore: number, awayScore: number
) => {
    await query(`
        INSERT INTO soccer_matches (
            match_id, home_team, away_team, start_time, status, 
            league, league_logo, score_home, score_away, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        ON CONFLICT (match_id) DO UPDATE SET 
            status = EXCLUDED.status,
            score_home = EXCLUDED.score_home,
            score_away = EXCLUDED.score_away,
            updated_at = NOW()
    `, [id, home, away, time.toISOString(), status, league, logo, homeScore, awayScore]);
};
