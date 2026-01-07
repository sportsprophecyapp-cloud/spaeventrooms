import { BaseRoom } from '../roomFactory';
import { Server } from 'socket.io';
import { query } from '../../shared/database';
import { authenticate, AuthRequest } from '../../shared/auth/middleware';
import { fetchLiveMatches } from '../../shared/services/footballApi';

export class SoccerRoom extends BaseRoom {
    constructor() {
        super({
            roomId: 'soccer',
            displayName: 'Pro Soccer'
        });
    }

    initRoutes(): void {
        // GET /api/rooms/soccer/matches (Grouped by League)
        this.router.get('/matches', async (req, res) => {
            try {
                const result = await query(`
                    SELECT * FROM soccer_matches 
                    WHERE start_time > NOW() - INTERVAL '24 hours' 
                    AND start_time < NOW() + INTERVAL '48 hours'
                    ORDER BY league ASC, start_time ASC
                `);

                const matches = result.rows;
                const grouped: Record<string, any[]> = {};

                matches.forEach(match => {
                    const leagueName = match.league || 'International / Other';
                    if (!grouped[leagueName]) grouped[leagueName] = [];
                    grouped[leagueName].push(match);
                });

                // Convert to array of sections for the frontend
                const sections = Object.keys(grouped).map(league => ({
                    title: league,
                    logo: grouped[league][0]?.league_logo || '',
                    matches: grouped[league]
                }));

                res.json(sections);
            } catch (err) {
                console.error('Error fetching matches:', err);
                res.json([]);
            }
        });

        // POST /api/rooms/soccer/predictions/match
        this.router.post('/predictions/match', authenticate, async (req: AuthRequest, res) => {
            const { matchId, pick } = req.body;
            const userId = req.user?.id;

            if (!matchId || !pick) {
                return res.status(400).json({ message: 'matchId and pick are required' });
            }

            try {
                await query(`
                    INSERT INTO soccer_predictions (user_id, match_id, prediction_data)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (user_id, match_id) 
                    DO UPDATE SET prediction_data = EXCLUDED.prediction_data, created_at = CURRENT_TIMESTAMP
                `, [userId, matchId, JSON.stringify({ pick })]);

                res.json({ success: true, message: 'Prophecy Transmitted!' });
            } catch (err) {
                console.error('Error saving prediction:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        // POST /api/rooms/soccer/refresh (Admin tool)
        this.router.post('/refresh', async (req, res) => {
            try {
                await fetchLiveMatches();
                res.json({ success: true, message: 'Arena data refreshed' });
            } catch (err) {
                res.status(500).json({ error: 'Refresh failed' });
            }
        });
    }

    initSocket(io: Server): void {
        this.ioNamespace = io.of(`/rooms/${this.roomId}`);
        this.ioNamespace.on('connection', (socket) => {
            socket.on('join_room', (room) => socket.join(room));
        });
    }

    onSponsorUpdate(data: any): void {
        if (this.ioNamespace) {
            this.ioNamespace.emit('sponsor_update', data);
        }
    }
}
