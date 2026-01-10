import { query } from '../shared/database';

async function fixTable() {
    console.log('🛠️ Fixing cosmetics table schema...');

    try {
        // 1. Drop dependent table first
        await query('DROP TABLE IF EXISTS user_cosmetics CASCADE');

        // 2. Drop cosmetics table
        await query('DROP TABLE IF EXISTS cosmetics CASCADE');

        // 3. Recreate cosmetics table with VARCHAR ID
        await query(`
            CREATE TABLE cosmetics (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                type VARCHAR(50) NOT NULL,
                cost INTEGER NOT NULL DEFAULT 0,
                asset_url TEXT,
                description TEXT,
                requirement TEXT,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 4. Recreate user_cosmetics table
        await query(`
            CREATE TABLE user_cosmetics (
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                cosmetic_id VARCHAR(50) REFERENCES cosmetics(id) ON DELETE CASCADE,
                is_equipped BOOLEAN DEFAULT false,
                acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, cosmetic_id)
            )
        `);

        console.log('✅ Tables successfully recreated with correct types.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error fixing table:', err);
        process.exit(1);
    }
}

fixTable();
