import { createClient as createRedisClient } from 'redis';
import { promisify } from 'util';

export const redisClient = createRedisClient(process.env.REDISCLOUD_URL, {no_ready_check: true});
export const getAsync = client => promisify(client.get).bind(client);




