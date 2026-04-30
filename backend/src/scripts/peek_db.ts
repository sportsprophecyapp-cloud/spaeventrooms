import pool from '../shared/database';

async function peek() {
    try {
        const res = await pool.query('SELECT prediction_data FROM nhl_predictions LIMIT 5');
        console.log('PEEK DATA:', JSON.stringify(res.rows, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
peek();
