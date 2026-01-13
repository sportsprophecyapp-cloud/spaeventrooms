import axios from 'axios';
import { query } from '../database';
import { LogoService } from './LogoService';

// Configuration - Focused solely on Soccer for now
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

const rotateKey = () => {
    if (API_KEYS.length <= 1) return false;
    const oldIndex = currentKeyIndex;
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    console.log(`🔄 API Key Expired or Invalid. Rotating: Index ${oldIndex} ➔ ${currentKeyIndex}`);
    return true;
};

export const fetchLiveMatches = async () => {
    // 1. Fallback immediately if no keys are configured
    if (API_KEYS.length === 0) {
        console.warn('⚠️ No THE_ODDS_API_KEYs found. Data sync will be skipped.');
        return;
    }

    let count = 0;
    console.log(`📡 Arena Sync: Starting batch using API Key Index ${currentKeyIndex}...`);

    // We process leagues one by one to handle key failures gracefully
    for (const sportKey of SPORTS) {
        let success = false;
        let retryCount = 0;

        while (!success && retryCount < API_KEYS.length) {
            try {
                const response = await axios.get(`${API_HOST}/v4/sports/${sportKey}/scores/`, {
                    params: { apiKey: API_KEYS[currentKeyIndex], daysFrom: 3 }
                });

                const data = response.data;
                if (Array.isArray(data)) {
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

                        const home_logo = await LogoService.getLogo(m.home_team);
                        const away_logo = await LogoService.getLogo(m.away_team);

                        await query(`
                            INSERT INTO soccer_matches (
                                match_id, home_team, away_team, start_time, status, 
                                league, league_logo, score_home, score_away, home_logo, away_logo, updated_at
                            )
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
                            ON CONFLICT (match_id) DO UPDATE SET 
                                status = EXCLUDED.status,
                                score_home = EXCLUDED.score_home,
                                score_away = EXCLUDED.score_away,
                                home_logo = EXCLUDED.home_logo,
                                away_logo = EXCLUDED.away_logo,
                                updated_at = NOW()
                        `, [
                            String(m.id), m.home_team, m.away_team, m.commence_time,
                            status, LEAGUE_NAMES[sportKey] || sportKey, LEAGUE_LOGOS[sportKey] || '',
                            score_home, score_away, home_logo, away_logo
                        ]);
                        count++;
                    }
                }
                success = true; // Key worked, move to next sport
            } catch (err: any) {
                const status = err.response?.status;
                if (status === 401 || status === 429) {
                    console.warn(`⚠️ Key Index ${currentKeyIndex} failed (${status}). Attempting rotation...`);
                    const rotated = rotateKey();
                    if (!rotated) {
                        // 2. Fallback if keys expire/fail during runtime
                        console.error('❌ No more working API keys available. Sync aborted.');
                        return; // Stop the entire batch
                    }
                    retryCount++;
                } else {
                    console.error(`❌ Non-auth error for ${sportKey}: ${err.message}`);
                    success = true; // Skip this league but keep going
                }
            }
        }
    }

    console.log(`✅ Sync Complete: ${count} matches updated in database.`);
};
