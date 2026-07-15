import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Redis if URL is provided
export const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;

if (redis) {
  redis.on('error', (err) => {
    console.error('Redis error:', err);
  });
  
  redis.on('connect', () => {
    console.log('Connected to Redis server');
  });
} else {
  console.log('No REDIS_URL provided. Running without Redis.');
}
