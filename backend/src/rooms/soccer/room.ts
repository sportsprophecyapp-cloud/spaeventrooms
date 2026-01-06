import { BaseRoom } from '../roomFactory';
import { Server } from 'socket.io';
import { query } from '../../shared/database';
import { authenticate, AuthRequest } from '../../shared/auth/middleware';

export class SoccerRoom extends BaseRoom {
    constructor() {
        super({
            roomId: 'soccer',
            displayName: 'Pro Soccer'
        });
    }

    initRoutes(): void {
        this.router.get('/matches', async (req, res) => {
            try {
                const result = await query('SELECT * FROM soccer_matches ORDER BY league ASC, start_time ASC');

                // Group by league
                const matches = result.rows;
                const grouped: Record<string, any[]> = {};

                matches.forEach(match => {
                    const leagueName = match.league || 'Unknown League';
                    if (!grouped[leagueName]) {
                        grouped[leagueName] = [];
                    }
                    grouped[leagueName].push(match);
                });

                // Transform to array of sections for easier frontend rendering if needed, 
                // OR just return the object. User asked "setup into sections".
                // Let's return a list where each item is { title: "Premier League", matches: [...] }
                const sections = Object.keys(grouped).map(league => ({
                    title: league,
                    logo: grouped[league][0]?.league_logo,
                    matches: grouped[league]
                }));

                res.json(sections);
            } catch (err) {
                console.error('Error fetching matches:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        this.router.post('/predictions', authenticate, async (req: AuthRequest, res) => {
            const { matchId, pick } = req.body;
            const userId = req.user.id;

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

                res.json({ success: true, message: 'Prediction saved' });
            } catch (err) {
                console.error('Error saving prediction:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        this.router.patch('/matches/:matchId', authenticate, async (req: AuthRequest, res) => {
            const { matchId } = req.params;
            const { score_home, score_away, status } = req.body;

            try {
                const result = await query(`
                    UPDATE soccer_matches 
                    SET score_home = COALESCE($1, score_home),
                        score_away = COALESCE($2, score_away),
                        status = COALESCE($3, status),
                        updated_at = CURRENT_TIMESTAMP
                    WHERE match_id = $4
                    RETURNING *
                `, [score_home, score_away, status, matchId]);

                if (result.rows.length === 0) {
                    return res.status(404).json({ message: 'Match not found' });
                }

                const updatedMatch = result.rows[0];

                // Emit socket event
                if (this.ioNamespace) {
                    this.ioNamespace.emit('match_update', updatedMatch);
                }

                res.json(updatedMatch);
            } catch (err) {
                console.error('Error updating match:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });
    }

    initSocket(io: Server): void {
        this.ioNamespace = io.of(`/rooms/${this.roomId}`);

        this.ioNamespace.on('connection', (socket) => {
            console.log(`User connected to ${this.displayName} room`);

            socket.on('join_room', (room) => {
                socket.join(room);
            });

            socket.on('disconnect', () => {
                console.log('User disconnected from soccer room');
            });
        });
    }

    onSponsorUpdate(data: any): void {
        console.log('Sponsor update received', data);
        if (this.ioNamespace) {
            this.ioNamespace.emit('sponsor_update', data);
        }
    }
}
