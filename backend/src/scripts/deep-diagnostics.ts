import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import { query } from '../shared/database';

const deepResolveDiagnostics = async () => {
    console.log('🔍 DEEP DIAGNOSTICS: Why are predictions still pending?');

    try {
        // 1. Total Pending Count
        const totalPending = await query("SELECT COUNT(*) FROM soccer_predictions WHERE result = 'pending'");
        console.log(`📊 Total Pending Predictions in DB: ${totalPending.rows[0].count}`);

        // 2. Check for join mismatches
        const orphanedPredictions = await query(`
            SELECT COUNT(p.id) 
            FROM soccer_predictions p
            LEFT JOIN soccer_matches m ON p.match_id = m.match_id
            WHERE m.match_id IS NULL AND p.result = 'pending'
        `);
        console.log(`🚨 Orphaned Predictions (No matching game ID): ${orphanedPredictions.rows[0].count}`);

        // 3. Sample of Pending Predictions and their Match data
        const sample = await query(`
            SELECT 
                p.id as pred_id, 
                p.match_id, 
                m.status as match_status, 
                m.start_time, 
                m.home_team, 
                m.away_team
            FROM soccer_predictions p
            JOIN soccer_matches m ON p.match_id = m.match_id
            WHERE p.result = 'pending'
            LIMIT 5
        `);

        console.log('\n📋 Sample of Pending Entries:');
        sample.rows.forEach(r => {
            console.log(`- Pred ${r.pred_id} | Match ${r.match_id} | Status: ${r.match_status} | Start: ${r.start_time}`);
        });

        // 4. Check 'NOW()' vs 'start_time' discrepancy
        const timeCheck = await query("SELECT NOW() as db_now");
        console.log(`\n🕒 Database 'NOW()': ${timeCheck.rows[0].db_now}`);
        console.log(`🕒 System Time: ${new Date().toISOString()}`);

    } catch (err) {
        console.error('❌ Diagnostics failed:', err);
    } finally {
        process.exit(0);
    }
};

deepResolveDiagnostics();
