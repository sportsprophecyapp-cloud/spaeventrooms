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
                    COUNT(CASE WHEN p.prediction_data->>'pick' = 'home' THEN 1 END) as home_votes,
                    COUNT(CASE WHEN p.prediction_data->>'pick' = 'away' THEN 1 END) as away_votes
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
                    COUNT(CASE WHEN p.prediction_data->>'pick' = 'home' THEN 1 END) as home_votes,
                    COUNT(CASE WHEN p.prediction_data->>'pick' = 'away' THEN 1 END) as away_votes
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
