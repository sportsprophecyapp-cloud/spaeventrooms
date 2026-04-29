import axios from 'axios';
import { query } from '../database';
import { LogoService } from './LogoService';

const SPORTS = [
    'icehockey_nhl'
];

const API_KEYS = (process.env.THE_ODDS_API_KEY || '').split(',').map(k => k.trim()).filter(k => k);
let currentKeyIndex = 0;

const API_HOST = 'https://api.the-odds-api.com';

const rotateKey = () => {
    if (API_KEYS.length <= 1) return false;
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    return true;
};

let API_QUOTA_EXHAUSTED = false;

export const fetchLiveNhlMatches = async () => {
    if (API_QUOTA_EXHAUSTED) return;
    if (API_KEYS.length === 0) return 0;

    let count = 0;
    let minRemaining = 999999;

    for (const sportKey of SPORTS) {
        let success = false;
        let retryCount = 0;

        while (!success && retryCount < API_KEYS.length) {
            try {
                const response = await axios.get(`${API_HOST}/v4/sports/${sportKey}/scores/`, {
                    params: { apiKey: API_KEYS[currentKeyIndex], daysFrom: 3 }
                });

                const requestsRemaining = parseInt(response.headers['x-requests-remaining']);
                if (!isNaN(requestsRemaining)) {
                    minRemaining = Math.min(minRemaining, requestsRemaining);
                    if (requestsRemaining < 10) API_QUOTA_EXHAUSTED = true;
                }

                if (Array.isArray(response.data)) {
                    for (const m of response.data) {
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
                            INSERT INTO nhl_matches (
                                match_id, home_team, away_team, start_time, status, 
                                league, score_home, score_away, home_logo, away_logo, updated_at
                            )
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
                            ON CONFLICT (match_id) DO UPDATE SET 
                                status = EXCLUDED.status,
                                score_home = EXCLUDED.score_home,
                                score_away = EXCLUDED.score_away,
                                home_logo = EXCLUDED.home_logo,
                                away_logo = EXCLUDED.away_logo,
                                start_time = EXCLUDED.start_time,
                                updated_at = NOW()
                        `, [
                            String(m.id), m.home_team, m.away_team, m.commence_time,
                            status, 'NHL', score_home, score_away, home_logo, away_logo
                        ]);
                        count++;
                    }
                }
                success = true;
            } catch (err: any) {
                const status = err.response?.status;
                if (status === 401 || status === 429) {
                    if (!rotateKey()) return;
                    retryCount++;
                } else {
                    success = true;
                }
            }
        }
    }
    console.log(`✅ NHL Sync Complete: ${count} matches updated in database.`);
};
