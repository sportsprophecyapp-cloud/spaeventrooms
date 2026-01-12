import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Helper for single queries
export const query = (text: string, params?: any[]) => pool.query(text, params);

// Helper to get a client from the pool (for transactions)
export const getClient = () => pool.connect();

export default pool;
