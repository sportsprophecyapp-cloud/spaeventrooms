import { Request, Response } from 'express';
import { query } from '../database';

export const getPulsePicks = async (req: Request, res: Response) => {
    try {
        // 1. Get sentiment for all active matches (simplified for now)
        // In a real production app, we would cache this or use a materialized view.
        
        const sql = `
            WITH all_match_sentiment AS (
                SELECT 
                    'nhl' as room_id,
                    m.match_id,
                    m.home_team,
                    m.away_team,
                    m.home_logo,
                    m.away_logo,
                    m.start_time,
                    COUNT(p.user_id) as total_votes,
                    COUNT(CASE WHEN p.prediction_data->>'pick' = m.home_team THEN 1 END) as home_votes,
                    COUNT(CASE WHEN p.prediction_data->>'pick' = m.away_team THEN 1 END) as away_votes
                FROM nhl_matches m
                LEFT JOIN nhl_predictions p ON m.match_id = p.match_id
                WHERE m.start_time > CURRENT_TIMESTAMP
                GROUP BY m.match_id, m.home_team, m.away_team, m.home_logo, m.away_logo, m.start_time
                
                UNION ALL
                
                SELECT 
                    'soccer' as room_id,
                    m.match_id,
                    m.home_team,
                    m.away_team,
                    m.home_logo,
                    m.away_logo,
                    m.start_time,
                    COUNT(p.user_id) as total_votes,
                    COUNT(CASE WHEN p.prediction_data->>'pick' = m.home_team THEN 1 END) as home_votes,
                    COUNT(CASE WHEN p.prediction_data->>'pick' = m.away_team THEN 1 END) as away_votes
                FROM soccer_matches m
                LEFT JOIN soccer_predictions p ON m.match_id = p.match_id
                WHERE m.start_time > CURRENT_TIMESTAMP
                GROUP BY m.match_id, m.home_team, m.away_team, m.home_logo, m.away_logo, m.start_time
            )
            SELECT *,
                   CASE 
                     WHEN total_votes > 0 THEN ABS((home_votes::float / total_votes) - 0.5)
                     ELSE 1.0 
                   END as heat_index
            FROM all_match_sentiment
            WHERE total_votes >= 0
            ORDER BY total_votes DESC
            LIMIT 10;
        `;

        const result = await query(sql);
        
        // Find specific picks
        const matches = result.rows.map(m => {
            const total = parseInt(m.total_votes);
            return {
                ...m,
                percentages: {
                    home: total > 0 ? Math.round((parseInt(m.home_votes) / total) * 100) : 50,
                    away: total > 0 ? Math.round((parseInt(m.away_votes) / total) * 100) : 50
                }
            };
        });

        // The "Public Lock" (Highest total votes)
        const publicLock = matches[0] || null;

        // The "Coin Toss" (Lowest heat index - closest to 50/50)
        const coinToss = [...matches].sort((a, b) => a.heat_index - b.heat_index)[0] || null;

        res.json({
            publicLock,
            coinToss,
            all: matches
        });
    } catch (err) {
        console.error('Error fetching pulse picks:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getLiveTicker = async (req: Request, res: Response) => {
    try {
        // Priority: live > upcoming within 7 days > recently finished (48h)
        const primarySql = `
            SELECT home_team, away_team, score_home, score_away, status, start_time, 'soccer' as sport
            FROM soccer_matches
            WHERE status = 'live'
               OR (status = 'finished' AND updated_at > CURRENT_TIMESTAMP - INTERVAL '48 hours')
               OR (status = 'upcoming' AND start_time < CURRENT_TIMESTAMP + INTERVAL '7 days')
            
            UNION ALL
            
            SELECT home_team, away_team, score_home, score_away, status, start_time, 'nhl' as sport
            FROM nhl_matches
            WHERE status = 'live'
               OR (status = 'finished' AND updated_at > CURRENT_TIMESTAMP - INTERVAL '48 hours')
               OR (status = 'upcoming' AND start_time < CURRENT_TIMESTAMP + INTERVAL '7 days')
            
            ORDER BY 
                CASE WHEN status = 'live' THEN 0 WHEN status = 'upcoming' THEN 1 ELSE 2 END ASC,
                start_time ASC
            LIMIT 15;
        `;

        let result = await query(primarySql);

        // Fallback — if DB still empty, grab anything available
        if (result.rows.length === 0) {
            const fallbackSql = `
                (SELECT home_team, away_team, score_home, score_away, status, start_time, 'soccer' as sport
                 FROM soccer_matches 
                 WHERE status IN ('upcoming', 'live')
                    OR (status = 'finished' AND updated_at > CURRENT_TIMESTAMP - INTERVAL '72 hours')
                 ORDER BY start_time DESC LIMIT 8)
                UNION ALL
                (SELECT home_team, away_team, score_home, score_away, status, start_time, 'nhl' as sport
                 FROM nhl_matches 
                 WHERE status IN ('upcoming', 'live')
                    OR (status = 'finished' AND updated_at > CURRENT_TIMESTAMP - INTERVAL '72 hours')
                 ORDER BY start_time DESC LIMIT 7)
                ORDER BY start_time ASC
                LIMIT 15;
            `;
            result = await query(fallbackSql);
        }

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching live ticker:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
