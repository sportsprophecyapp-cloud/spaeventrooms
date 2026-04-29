import { getClient } from '../src/shared/database';
import fs from 'fs';
import path from 'path';

async function backup() {
    const client = await getClient();
    try {
        console.log('🛡️ Starting Node.js Full Database Backup...');
        
        // Get all user tables
        const res = await client.query(`
            SELECT tablename 
            FROM pg_catalog.pg_tables 
            WHERE schemaname = 'public';
        `);
        
        const tables = res.rows.map((row: any) => row.tablename);
        const backupData: any = {};
        
        for (const table of tables) {
            console.log(`📦 Dumping table: ${table}...`);
            const data = await client.query(`SELECT * FROM "public"."${table}"`);
            backupData[table] = data.rows;
        }
        
        const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
        const backupDir = path.join(__dirname, '..', 'backups', timestamp);
        fs.mkdirSync(backupDir, { recursive: true });
        
        const filePath = path.join(backupDir, 'database-v3.5.0.json');
        fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));
        
        console.log(`✅ Backup successfully saved to ${filePath}`);
    } catch (err) {
        console.error('❌ Backup failed:', err);
    } finally {
        client.release();
        process.exit(0);
    }
}

backup();
