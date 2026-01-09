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

        const result = await query(`
            SELECT 
                match_id as id, 
                home_team, 
                away_team, 
                start_time, 
                league_logo
            FROM soccer_matches
            WHERE league = $1 AND status = 'scheduled'
            ORDER BY start_time ASC
            LIMIT 20
        `, [dbLeagueName]);

        res.json(result.rows);
    } catch (err) {
        console.error(`[FATAL] Could not fetch matches for league ${league}:`, err);
        res.status(500).json({ error: 'A server error occurred while fetching matches.' });
    }
};
