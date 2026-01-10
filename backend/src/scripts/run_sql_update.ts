import pool from '../shared/database';
import fs from 'fs';
import path from 'path';

const runUpdates = async () => {
    const sqlPath = path.join(__dirname, 'update_logos_auto.sql');
    if (!fs.existsSync(sqlPath)) {
        console.error('SQL file not found!');
        process.exit(1);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');
    const client = await pool.connect();

    try {
        console.log('Applying logo updates...');
        await client.query(sql);
        console.log('✅ Database updated successfully!');
    } catch (err) {
        console.error('Error applying SQL:', err);
    } finally {
        client.release();
        process.exit(0);
    }
};

runUpdates();
