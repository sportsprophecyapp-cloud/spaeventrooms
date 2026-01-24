import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import { query } from '../shared/database';

const inspectUsers = async () => {
    console.log('🔍 Inspecting [users] table schema:');

    try {
        const columns = await query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users'
        `);

        columns.rows.forEach(c => {
            console.log(`- ${c.column_name.padEnd(20)} | ${c.data_type}`);
        });

    } catch (err) {
        console.error('❌ Inspection failed:', err);
    } finally {
        process.exit(0);
    }
};

inspectUsers();
