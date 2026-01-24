import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import { query } from '../shared/database';

const listTables = async () => {
    console.log('📋 Accurate Database Audit:');

    try {
        const tables = await query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);

        for (const r of tables.rows) {
            const countRes = await query(`SELECT COUNT(*) FROM ${r.table_name}`);
            console.log(`- ${r.table_name.padEnd(25)} | Rows: ${countRes.rows[0].count}`);
        }

    } catch (err) {
        console.error('❌ Listing failed:', err);
    } finally {
        process.exit(0);
    }
};

listTables();
