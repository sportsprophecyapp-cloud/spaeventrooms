import pool, { query, getClient } from './postgres';
import redisClient, { connectRedis } from './redis';

export {
    pool,
    query,
    getClient,
    redisClient,
    connectRedis
};

export default pool;
