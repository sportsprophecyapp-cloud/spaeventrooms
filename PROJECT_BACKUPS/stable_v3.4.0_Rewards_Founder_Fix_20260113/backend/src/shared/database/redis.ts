import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
    url: process.env.REDIS_URL
});

client.on('error', (err) => console.log('Redis Client Error', err));

export const connectRedis = async () => {
    if (!process.env.REDIS_URL) {
        console.warn('REDIS_URL not set, skipping Redis connection');
        return;
    }
    try {
        await client.connect();
        console.log('Redis Connected');
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
        // Retry logic could go here
    }
};

export default client;
