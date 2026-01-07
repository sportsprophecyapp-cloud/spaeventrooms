import axios from 'axios';
import { query } from '../database';

// Support multiple keys separated by commas
const API_KEYS = (process.env.API_FOOTBALL_KEY || '').split(',').map(k => k.trim()).filter(k => k);
let currentKeyIndex = 0;

const API_HOST = 'https://v3.football.api-sports.io';
const LEAGUE_IDS = [39, 140, 78, 135, 61, 253];

const rotateKey = () => {
    if (API_KEYS.length <= 1) return false;
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    console.log(`🔄 API-Football Key Failed. Rotating to Index: ${currentKeyIndex}`);
    return true;
};

export const fetchApiFootballMatches = async () => {
    if (API_KEYS.length === 0) {
        console.log('ℹ️ API_FOOTBALL_KEY not set. Skipping.');
        return;
    }

    let success = false;
    let retryCount = 0;

    while (!success && retryCount < API_KEYS.length) {
        try {
            console.log(`📡 Fetching API-Football scores using key index ${currentKeyIndex}...`);
            const today = new Date().toISOString().split('T')[0];
            
            const response = await axios.get(`${API_HOST}/fixtures`, {
                params: { date: today },
                headers: {
                    'x-rapidapi-key': API_KEYS[currentKeyIndex],
                    'x-rapidapi-host': 'v3.football.api-sports.io'
                }
            });

            const fixtures = response.data.response;
            if (Array.isArray(fixtures)) {
                let count = 0;
                for (const f of fixtures) {
                    if (!LEAGUE_IDS.includes(f.league.id)) continue;

                    const match_id = `api-${f.fixture.id}`;
                    const status = f.fixture.status.short === 'FT' ? 'finished' : (f.fixture.status.short === 'NS' ? 'scheduled' : 'live');

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
                        match_id, f.teams.home.name, f.teams.away.name, f.fixture.date, 
                        status, f.league.name, f.league.logo, f.goals.home || 0, f.goals.away || 0
                    ]);
                    count++;
                }
                console.log(`✅ API-Football Sync: ${count} matches updated.`);
            }
            success = true;
        } catch (error: any) {
            const status = error.response?.status;
            if (status === 401 || status === 429) {
                if (!rotateKey()) {
                    console.error('❌ No more API-Football keys available.');
                    return;
                }
                retryCount++;
            } else {
                console.error('❌ API-Football Error:', error.message);
                success = true; // Skip on unknown errors
            }
        }
    }
};
