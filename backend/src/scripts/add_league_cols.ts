import pool from '../shared/database';

const migrate = async () => {
    const client = await pool.connect();
    try {
        console.log('Running migration: Add league columns to soccer_matches...');

        await client.query(`
            ALTER TABLE soccer_matches 
            ADD COLUMN IF NOT EXISTS league VARCHAR(100),
            ADD COLUMN IF NOT EXISTS league_logo VARCHAR(255);
        `);

        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        client.release();
        process.exit();
    }
};

migrate();
