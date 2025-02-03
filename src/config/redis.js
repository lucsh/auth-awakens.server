import { createClient } from 'redis';
import { REDIS_URL } from './config.js';

export const redisClient = createClient({ url: REDIS_URL });
redisClient.on('error', (err) => console.error('Redis Client Error', err));

export async function initializeRedis() {
  try {
    await redisClient.connect();
    console.log('Redis connected successfully!');
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
  }
}

initializeRedis();
