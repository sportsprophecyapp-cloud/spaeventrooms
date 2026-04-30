import pool from '../shared/database';

async function fixUtah() {
    try {
        console.log('🏒 Fixing Utah NHL Team Name...');
        
        // 1. Update nhl_matches
        await pool.query(`
            UPDATE nhl_matches 
            SET home_team = 'Utah Hockey Club',
                home_logo = '/assets/logos/nhl/UTA.svg'
            WHERE home_team = 'Utah Mammoth'
        `);

        await pool.query(`
            UPDATE nhl_matches 
            SET away_team = 'Utah Hockey Club',
                away_logo = '/assets/logos/nhl/UTA.svg'
            WHERE away_team = 'Utah Mammoth'
        `);

        // 2. Update existing predictions so they match the new name for sentiment
        await pool.query(`
            UPDATE nhl_predictions
            SET prediction_data = jsonb_set(prediction_data, '{pick}', '"Utah Hockey Club"')
            WHERE prediction_data->>'pick' = 'Utah Mammoth'
        `);

        console.log('✅ Utah team name and predictions updated.');
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
fixUtah();
