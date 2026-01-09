import pool from '../shared/database';

const fixTokenBalances = async () => {
    const client = await pool.connect();
    try {
        console.log('💰 Fixing token balances...');

        // Update users who have 0 or null tokens to the default 150
        const result = await client.query(`
            UPDATE users 
            SET token_balance = 150 
            WHERE token_balance IS NULL OR token_balance < 0;
        `);

        console.log(`✅ Updated ${result.rowCount} users with corrected balances.`);
    } catch (err) {
        console.error('❌ Failed to fix token balances:', err);
    } finally {
        client.release();
        process.exit(0);
    }
};

fixTokenBalances();
