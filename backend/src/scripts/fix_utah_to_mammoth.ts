import pool from '../shared/database';

async function fixUtah() {
    console.log('🏔️ Migrating Utah Hockey Club -> Utah Mammoth...');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Update nhl_matches
        await client.query(`
            UPDATE nhl_matches 
            SET home_team = 'Utah Mammoth' 
            WHERE home_team = 'Utah Hockey Club'
        `);
        await client.query(`
            UPDATE nhl_matches 
            SET away_team = 'Utah Mammoth' 
            WHERE away_team = 'Utah Hockey Club'
        `);

        // Update nhl_predictions
        await client.query(`
            UPDATE nhl_predictions 
            SET prediction_data = prediction_data || '{"pick": "Utah Mammoth"}'::jsonb
            WHERE prediction_data->>'pick' = 'Utah Hockey Club'
        `);

        // Update global team_logos
        await client.query(`
            UPDATE team_logos 
            SET team_name = 'Utah Mammoth' 
            WHERE team_name = 'Utah Hockey Club'
        `);

        await client.query('COMMIT');
        console.log('✅ Migration complete!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', err);
    } finally {
        client.release();
    }
}

fixUtah().then(() => process.exit(0));
