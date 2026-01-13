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

        // AWARD VOUCHER (Fix for missing rewards)
        const drawDetails = await query('SELECT title, prize, description FROM prize_draws WHERE id = $1', [drawId]);
        if (drawDetails.rows.length > 0) {
            const { title, prize, description } = drawDetails.rows[0];
            await query(
                `INSERT INTO user_vouchers (user_id, draw_id, title, description) 
                 VALUES ($1, $2, $3, $4)`,
                [winner.id, drawId, `WINNER: ${title}`, `Prize: ${prize}. ${description}`]
            );
            console.log(`🎁 Awarded voucher to User ${winner.id} for Draw ${drawId}`);

            // NEW: AWARD CHAMPION COSMETICS (v3.4.3)
            await query(
                `INSERT INTO cosmetics (id, name, type, description, requirement, asset_url, is_achievement_reward) 
                 VALUES ('draw_winner_avatar', 'Grand Champion', 'avatar', 'The ultimate arena victor.', 'Unlock by winning a prize draw.', '/assets/cosmetics/champion_avatar.png', true),
                        ('draw_winner_frame', 'Champion\\'s Crown', 'frame', 'A crown for the bold.', 'Unlock by winning a prize draw.', '/assets/cosmetics/champion_frame.png', true)
                 ON CONFLICT (id) DO UPDATE SET asset_url = EXCLUDED.asset_url, is_achievement_reward = EXCLUDED.is_achievement_reward`
            );

            await query(
                `INSERT INTO user_cosmetics (user_id, cosmetic_id) 
                 VALUES ($1, 'draw_winner_avatar'), ($1, 'draw_winner_frame') 
                 ON CONFLICT DO NOTHING`,
                [winner.id]
            );
            console.log(`👑 Awarded Champion Cosmetics to User ${winner.id}`);
        }

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
