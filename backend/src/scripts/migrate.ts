import pool from '../shared/database';
import fs from 'fs';
import path from 'path';

const runMigrations = async () => {
    const client = await pool.connect();
    try {
        console.log('Running migrations...');

        // Core Schema
        const coreSchema = fs.readFileSync(path.join(__dirname, '../shared/database/schema.sql'), 'utf8');
        await client.query(coreSchema);
        console.log('Core schema applied.');

        // Soccer Room Schema (In future, iterate over all rooms)
        const soccerSchema = fs.readFileSync(path.join(__dirname, '../rooms/soccer/schema.sql'), 'utf8');
        await client.query(soccerSchema);
        console.log('Soccer schema applied.');

        console.log('All migrations completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        client.release();
        process.exit();
    }
};

runMigrations();
