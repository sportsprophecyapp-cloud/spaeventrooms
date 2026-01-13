import pool from '../shared/database';

const enforceGating = async () => {
    const client = await pool.connect();
    try {
        console.log('🔒 Enforcing Achievement Gating for Avatars & Frames...');

        // Set ALL avatars and frames to be achievement rewards (cost 0, is_achievement_reward = true)
        const result = await client.query(`
            UPDATE cosmetics 
            SET is_achievement_reward = true, 
                cost = 0 
            WHERE type IN ('avatar', 'frame')
            RETURNING id, name, type, is_achievement_reward
        `);

        console.log(`✅ Enforced gating on ${result.rowCount} items.`);
        console.table(result.rows);

    } catch (err) {
        console.error('❌ Gating enforcement failed:', err);
    } finally {
        client.release();
        process.exit(0);
    }
};

enforceGating();
