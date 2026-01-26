import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

if (process.env.NODE_ENV === 'production') {
    const dbUrl = process.env.DATABASE_URL || '';
    const hostMatch = dbUrl.match(/@([^/]+)/);
    const host = hostMatch ? hostMatch[1] : 'unknown';
    console.log(`📡 DB Pool initialized (Production). Target Host: ${host.substring(0, 5)}...`);
}

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    if ((err as any).code === 'ENOTFOUND') {
        console.error(`🚨 DNS Resolution Error: Could not find host. Check DATABASE_URL.`);
    }
    process.exit(-1);
});

// Helper for single queries
export const query = (text: string, params?: any[]) => pool.query(text, params);

// Helper to get a client from the pool (for transactions)
export const getClient = () => pool.connect();

export default pool;
