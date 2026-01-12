import { query } from '../database';
import { socketService } from '../socket/SocketService';

/**
 * PRIZE DRAW SERVICE
 * Manages the awarding of virtual tickets for sponsor draws.
 */

export const awardDrawEntry = async (userId: number, entryType: 'streak' | 'referral' | 'accuracy', roomId: string = 'soccer') => {
    try {
        // 1. Find the currently active draw for this room
        const activeDraw = await query(
            'SELECT id FROM prize_draws WHERE room_id = $1 AND status = \'active\' LIMIT 1',
            [roomId]
        );

        if (activeDraw.rows.length === 0) {
            console.log(`ℹ️ No active draw found for ${roomId}. Entry not recorded.`);
            return;
        }

        const drawId = activeDraw.rows[0].id;

        // 2. Insert the entry
        await query(
            'INSERT INTO prize_draw_entries (draw_id, user_id, entry_type) VALUES ($1, $2, $3)',
            [drawId, userId, entryType]
        );

        console.log(`🎫 Awarded [${entryType}] draw entry to User ${userId} for Draw ${drawId}`);

    } catch (err) {
        console.error('❌ Failed to award draw entry:', err);
    }
};

/**
 * ADMIN: Pick a random winner from all entries
 */
export const pickWinner = async (drawId: number) => {
    try {
        const result = await query(`
            SELECT u.id, u.username, u.email 
            FROM prize_draw_entries e
            JOIN users u ON e.user_id = u.id
            WHERE e.draw_id = $1
            ORDER BY RANDOM()
            LIMIT 1
        `, [drawId]);

        if (result.rows.length === 0) return null;

        const winner = result.rows[0];

        // Mark draw as completed
        await query(
            'UPDATE prize_draws SET winner_id = $1, status = \'completed\', draw_date = NOW() WHERE id = $2',
            [winner.id, drawId]
        );

        // Notify winner in-app via Socket
        socketService.emitToRoom(`user:${winner.id}`, 'private_message', {
            from: 'System',
            message: `🎉 Congratulations! You have won the prize draw! Check your profile for details.`,
            timestamp: new Date().toISOString()
        });

        return winner;
    } catch (err) {
        console.error('❌ Error picking winner:', err);
        throw err;
    }
};
