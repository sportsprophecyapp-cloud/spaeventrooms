import { query } from '../shared/database';

async function fixBalances() {
    console.log('💰 Running balance fix script...');
    try {
        const result = await query(
            'UPDATE users SET token_balance = 150 WHERE token_balance = 0 OR token_balance IS NULL RETURNING id, username, token_balance'
        );
        console.log(`✅ Fixed balances for ${result.rowCount} users.`);
        result.rows.forEach(user => {
            console.log(` - User ID ${user.id} (${user.username || 'N/A'}): ${user.token_balance} tokens`);
        });
    } catch (err) {
        console.error('❌ Failed to fix balances:', err);
    } finally {
        process.exit(0);
    }
}

fixBalances();
