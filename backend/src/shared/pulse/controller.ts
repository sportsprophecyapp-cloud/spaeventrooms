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
               OR (status = 'scheduled' AND start_time < CURRENT_TIMESTAMP + INTERVAL '7 days')
            
            UNION ALL
            
            SELECT home_team, away_team, score_home, score_away, status, start_time, 'nhl' as sport
            FROM nhl_matches
            WHERE status = 'live'
               OR (status = 'finished' AND updated_at > CURRENT_TIMESTAMP - INTERVAL '48 hours')
               OR (status = 'scheduled' AND start_time < CURRENT_TIMESTAMP + INTERVAL '7 days')
            
            ORDER BY 
                CASE WHEN status = 'live' THEN 0 WHEN status = 'scheduled' THEN 1 ELSE 2 END ASC,
                start_time ASC
            LIMIT 15;
        `;

        let result = await query(primarySql);

        // Fallback — if DB still empty, grab anything available
        if (result.rows.length === 0) {
            const fallbackSql = `
                (SELECT home_team, away_team, score_home, score_away, status, start_time, 'soccer' as sport
                 FROM soccer_matches 
                 WHERE status IN ('scheduled', 'live')
                    OR (status = 'finished' AND updated_at > CURRENT_TIMESTAMP - INTERVAL '72 hours')
                 ORDER BY start_time DESC LIMIT 8)
                UNION ALL
                (SELECT home_team, away_team, score_home, score_away, status, start_time, 'nhl' as sport
                 FROM nhl_matches 
                 WHERE status IN ('scheduled', 'live')
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

// ─── NHL PLAYOFFS HUB ──────────────────────────────────────────────────────
export const getNhlPlayoffs = async (req: Request, res: Response) => {
    try {
        // Generate date strings for the last 20 days to cover the full first round
        const today = new Date();
        const dates: string[] = [];
        for (let i = 0; i <= 20; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            dates.push(d.toISOString().slice(0, 10).replace(/-/g, ''));
        }

        // Fetch all dates in parallel (ESPN scoreboard per day)
        const fetchDate = async (dateStr: string) => {
            try {
                const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard?dates=${dateStr}&limit=20`);
                if (!res.ok) return [];
                const data = await res.json() as any;
                return data.events || [];
            } catch { return []; }
        };

        const allEventArrays = await Promise.all(dates.map(fetchDate));
        const allEvents = allEventArrays.flat().filter((e: any) => {
            return e.competitions?.[0]?.series?.type === 'playoff';
        });

        const series: any[] = [];
        const seen = new Set<string>();

        for (const event of allEvents) {
            const comp = event.competitions?.[0];
            if (!comp?.series) continue;
            const seriesData = comp.series;
            const competitors = comp.competitors || [];
            if (competitors.length < 2) continue;

            const home = competitors.find((c: any) => c.homeAway === 'home');
            const away = competitors.find((c: any) => c.homeAway === 'away');
            if (!home || !away) continue;

            const key = [home.team.id, away.team.id].sort().join('-');
            if (seen.has(key)) continue;
            seen.add(key);

            const homeWins = seriesData.competitors?.find((c: any) => c.id === home.team.id)?.wins ?? 0;
            const awayWins = seriesData.competitors?.find((c: any) => c.id === away.team.id)?.wins ?? 0;

            series.push({
                id: key,
                round: (event.competitions?.[0]?.notes?.[0]?.headline || 'Playoff Series').replace(/\s*-\s*Game\s*\d+/i, '').trim(),
                summary: seriesData.summary || '',
                completed: seriesData.completed || false,
                home: {
                    id: home.team.id,
                    name: home.team.displayName,
                    abbr: home.team.abbreviation,
                    logo: home.team.logo,
                    color: `#${home.team.color}`,
                    wins: homeWins,
                    eliminated: awayWins === 4,
                },
                away: {
                    id: away.team.id,
                    name: away.team.displayName,
                    abbr: away.team.abbreviation,
                    logo: away.team.logo,
                    color: `#${away.team.color}`,
                    wins: awayWins,
                    eliminated: homeWins === 4,
                },
                status: comp.status?.type?.description || 'Scheduled',
                lastGame: {
                    home_score: home.score,
                    away_score: away.score,
                    detail: comp.status?.type?.shortDetail,
                }
            });
        }

        res.json({ season: '2025-26 Stanley Cup Playoffs', series });
    } catch (err) {
        console.error('Error fetching NHL playoffs:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// ─── FIFA WORLD CUP HUB ────────────────────────────────────────────────────
export const getWorldCup = async (req: Request, res: Response) => {
    try {
        const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?limit=100');
        if (!response.ok) throw new Error('ESPN API error');
        const data = await response.json() as any;

        const league = data.leagues?.[0];
        const season = league?.season;
        const events = data.events || [];

        const matches = events.map((event: any) => {
            const comp = event.competitions?.[0];
            const competitors = comp?.competitors || [];
            const home = competitors.find((c: any) => c.homeAway === 'home');
            const away = competitors.find((c: any) => c.homeAway === 'away');

            return {
                id: event.id,
                name: event.name,
                date: event.date,
                venue: comp?.venue?.fullName || '',
                status: comp?.status?.type?.description || 'Scheduled',
                statusDetail: comp?.status?.type?.detail || '',
                completed: comp?.status?.type?.completed || false,
                home: home ? {
                    id: home.team.id,
                    name: home.team.displayName,
                    abbr: home.team.abbreviation,
                    logo: home.team.logo,
                    color: `#${home.team.color}`,
                    score: home.score,
                    winner: home.winner,
                } : null,
                away: away ? {
                    id: away.team.id,
                    name: away.team.displayName,
                    abbr: away.team.abbreviation,
                    logo: away.team.logo,
                    color: `#${away.team.color}`,
                    score: away.score,
                    winner: away.winner,
                } : null,
            };
        });

        res.json({
            tournament: season?.displayName || '2026 FIFA World Cup',
            phase: season?.type?.name || 'Group Stage',
            startDate: season?.startDate,
            matches,
        });
    } catch (err) {
        console.error('Error fetching World Cup:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
