import axios from 'axios';
import { query } from '../database';

const API_KEY = process.env.API_FOOTBALL_KEY;
const API_HOST = 'https://v3.football.api-sports.io';

// Target League IDs for API-Football
// 39: Premier League, 140: La Liga, 78: Bundesliga, 135: Serie A, 61: Ligue 1, 253: MLS
const LEAGUE_IDS = [39, 140, 78, 135, 61, 253];

export const fetchApiFootballMatches = async () => {
    if (!API_KEY) {
        console.log('ℹ️ API_FOOTBALL_KEY not set. Skipping API-Football fetch.');
        return;
    }

    try {
        console.log('📡 Fetching matches from API-Football...');
        
        // Fetch fixtures for today
        const today = new Date().toISOString().split('T')[0];
        
        const response = await axios.get(`${API_HOST}/fixtures`, {
            params: { date: today },
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': 'v3.football.api-sports.io'
            }
        });

        const fixtures = response.data.response;
        if (!Array.isArray(fixtures)) return;

        let count = 0;
        for (const f of fixtures) {
            // Only process our target leagues
            if (!LEAGUE_IDS.includes(f.league.id)) continue;

            const match_id = `api-${f.fixture.id}`;
            const start_time = f.fixture.date;
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
                match_id, f.teams.home.name, f.teams.away.name, start_time, 
                status, f.league.name, f.league.logo, f.goals.home || 0, f.goals.away || 0
            ]);
            count++;
        }
        console.log(`✅ API-Football Sync: ${count} matches updated.`);
    } catch (error: any) {
        console.error('❌ API-Football Error:', error.message);
    }
};
