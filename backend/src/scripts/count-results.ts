import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import { query } from '../shared/database';

const countResults = async () => {
    console.log('📊 Result Distribution in soccer_predictions:');

    try {
        const stats = await query("SELECT result, COUNT(*) FROM soccer_predictions GROUP BY result");
        stats.rows.forEach(r => {
            console.log(`- Status: [${r.result}] Count: ${r.count}`);
        });

        const usersWithPending = await query(`
            SELECT user_id, COUNT(*) as count 
            FROM soccer_predictions 
            WHERE result = 'pending' 
            GROUP BY user_id
        `);

        console.log('\n👤 Users with Pending Predictions:');
        usersWithPending.rows.forEach(r => {
            console.log(`- User ID: ${r.user_id} | Count: ${r.count}`);
        });

    } catch (err) {
        console.error('❌ Stats failed:', err);
    } finally {
        process.exit(0);
    }
};

countResults();
