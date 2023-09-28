import { createClient } from 'redis';
import type { RedisClientType } from 'redis';
import logger from '@src/utils/logger';

let redisClient: RedisClientType;

if (process.env.REDIS_URL !== undefined) {
  redisClient = createClient({ url: process.env.REDIS_URL });
} else {
  redisClient = createClient();
}

redisClient.on('connect', () => {
  logger.info('[REDIS CONNECTION]: Connected to Redis...');
});

redisClient.on('end', () => {
  logger.info('[REDIS DISCONNECTION]: Disconnected to Redis...');
});

redisClient.on('error', (err: any) => {
  logger.error(`[REDIS CLIENT ERROR]: ${err?.message as string}`);
});

export default redisClient;
