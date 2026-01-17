import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import { query } from '../shared/database';

/**
 * CLEAR ALL PENDING PREDICTIONS
 * Simple cleanup script to mark all pending predictions as expired
 * Use this when you want to start fresh without wasting API calls
 */
const clearPendingPredictions = async () => {
    console.log('🧹 Clearing all pending predictions...');

    try {
        // 1. Count current pending predictions
        const countResult = await query(`
            SELECT COUNT(*) as count 
            FROM soccer_predictions 
            WHERE result = 'pending'
        `);

        const pendingCount = parseInt(countResult.rows[0].count);
        console.log(`📊 Found ${pendingCount} pending predictions`);

        if (pendingCount === 0) {
            console.log('✅ No pending predictions to clear!');
            process.exit(0);
        }

        // 2. Mark all pending predictions as 'expired' (no points awarded)
        const updateResult = await query(`
            UPDATE soccer_predictions 
            SET result = 'expired', points_earned = 0 
            WHERE result = 'pending'
            RETURNING id
        `);

        console.log(`✅ Cleared ${updateResult.rowCount} pending predictions`);
        console.log('🎯 All predictions marked as expired. Starting fresh!');

    } catch (err) {
        console.error('❌ Clear failed:', err);
    } finally {
        process.exit(0);
    }
};

clearPendingPredictions();
