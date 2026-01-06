import axios from 'axios';
import { query } from '../database';

// Configuration
const SPORTS = [
    'soccer_epl',
    'soccer_spain_la_liga',
    'soccer_germany_bundesliga',
    'soccer_italy_serie_a',
    'soccer_france_ligue_one',
    'soccer_usa_mls'
];

// Supports multiple keys separated by commas in .env: KEY1,KEY2,KEY3
const API_KEYS = (process.env.THE_ODDS_API_KEY || '').split(',').map(k => k.trim()).filter(k => k);
let currentKeyIndex = 0;

const API_HOST = 'https://api.the-odds-api.com';

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

/**
 * Gets the next available API key in the rotation
 */
const getActiveKey = () => {
    if (API_KEYS.length === 0) return null;
    return API_KEYS[currentKeyIndex];
};

/**
 * Moves to the next key if the current one fails
 */
const rotateKey = () => {
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    console.log(`🔄 Rotating to API Key Index: ${currentKeyIndex}`);
};

export const fetchLiveMatches = async () => {
    let apiKey = getActiveKey();
    if (!apiKey) {
        console.error('❌ No THE_ODDS_API_KEYs found.');
        return;
    }

    try {
        console.log(`📡 Fetching soccer data using key index ${currentKeyIndex}...`);
        
        const requests = SPORTS.map(async (sportKey) => {
            try {
                const response = await axios.get(`${API_HOST}/v4/sports/${sportKey}/scores/`, {
                    params: { apiKey: getActiveKey(), daysFrom: 3 }
                });
                return { key: sportKey, data: response.data };
            } catch (err: any) {
                if (err.response?.status === 401 || err.response?.status === 429) {
                    rotateKey(); // Switch key on auth or limit error
                }
                console.error(`⚠️ Failed to fetch ${sportKey}: ${err.message}`);
                return { key: sportKey, data: [] };
            }
        });

        const results = await Promise.all(requests);
        let count = 0;

        for (const { key, data } of results) {
            if (!Array.isArray(data)) continue;

            for (const m of data) {
                let score_home = 0;
                let score_away = 0;

                if (m.scores && m.scores.length > 0) {
                    const hScore = m.scores.find((s: any) => s.name === m.home_team);
                    const aScore = m.scores.find((s: any) => s.name === m.away_team);
                    score_home = hScore ? parseInt(hScore.score) : 0;
                    score_away = aScore ? parseInt(aScore.score) : 0;
                }

                let status = 'scheduled';
                if (m.completed) status = 'finished';
                else if (new Date(m.commence_time) < new Date()) status = 'live';

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
                `, [
                    String(m.id), m.home_team, m.away_team, m.commence_time, 
                    status, LEAGUE_NAMES[key] || key, LEAGUE_LOGOS[key] || '',
                    score_home, score_away
                ]);
                count++;
            }
        }
        console.log(`✅ Database Updated: ${count} matches synced.`);
    } catch (error) {
        console.error('❌ Global error in fetchLiveMatches:', error);
    }
};
