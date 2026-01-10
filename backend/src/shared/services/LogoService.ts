import { query } from '../database';
import { teamIdMap } from '../utils/teamLogos';

export class LogoService {
    /**
     * Get a logo URL for a team, prioritizing verified DB entries then the static map.
     */
    static async getLogo(teamName: string): Promise<string> {
        try {
            // 1. Check DB first
            const dbResult = await query('SELECT logo_url FROM team_logos WHERE team_name = $1', [teamName]);
            if (dbResult.rows.length > 0) {
                return dbResult.rows[0].logo_url;
            }

            // 2. Check Static Map
            const staticId = teamIdMap[teamName];
            if (staticId) {
                const url = `https://media.api-sports.io/football/teams/${staticId}.png`;
                // Auto-register in DB for next time
                await query(
                    'INSERT INTO team_logos (team_name, logo_url, is_verified) VALUES ($1, $2, true) ON CONFLICT DO NOTHING',
                    [teamName, url]
                );
                return url;
            }

            // 3. Heuristic Fallback (Necessary until official seed is successful)
            const heuristicUrl = `https://media.api-sports.io/football/teams/${teamName.replace(/\s+/g, '').toLowerCase()}.png`;
            // Register as unverified so we can audit later
            await query(
                'INSERT INTO team_logos (team_name, logo_url, is_verified) VALUES ($1, $2, false) ON CONFLICT DO NOTHING',
                [teamName, heuristicUrl]
            );
            return heuristicUrl;
        } catch (err) {
            console.error(`Error in LogoService.getLogo for ${teamName}:`, err);
            return `/logos/soccer-placeholder.png`;
        }
    }
}
