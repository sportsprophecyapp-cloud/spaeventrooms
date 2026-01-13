import { Request, Response } from 'express';
import { query } from '../database';

export const getMatchesByLeague = async (req: Request, res: Response) => {
    const { league } = req.query;

    if (!league) {
        return res.status(400).json({ message: 'A league parameter is required.' });
    }

    try {
        // The league names in the DB are like 'Premier League', but the query uses 'soccer_epl'
        // We need a mapping to translate.
        const leagueNameMap: { [key: string]: string } = {
            'soccer_epl': 'Premier League',
            'soccer_spain_la_liga': 'La Liga',
            'soccer_germany_bundesliga': 'Bundesliga',
            'soccer_italy_serie_a': 'Serie A',
            'soccer_france_ligue_one': 'Ligue 1',
            'soccer_usa_mls': 'MLS'
        };

        const dbLeagueName = leagueNameMap[league as string];

        if (!dbLeagueName) {
            return res.status(404).json({ message: 'Invalid league specified.' });
        }

        // Fix: get user ID from authenticated request
        // Note: The route uses 'authenticate' middleware, so req.user should be populated.
        // Cast to AuthRequest if needed or just use (req as any).user
        const userId = (req as any).user?.id;

        const result = await query(`
            SELECT 
                m.match_id, 
                m.home_team, 
                m.away_team,
                m.home_logo,
                m.away_logo,
                m.start_time,
                m.status,
                m.league_logo
            FROM soccer_matches m
            LEFT JOIN soccer_predictions p ON m.match_id = p.match_id AND p.user_id = $2
            WHERE m.league = $1 
              AND m.status = 'scheduled'
              AND p.id IS NULL
            ORDER BY m.start_time ASC
            LIMIT 20
        `, [dbLeagueName, userId]);

        res.json(result.rows);
    } catch (err) {
        console.error(`[FATAL] Could not fetch matches for league ${league}:`, err);
        res.status(500).json({ error: 'A server error occurred while fetching matches.' });
    }
};
