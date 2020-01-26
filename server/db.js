import { createClient as createRedisClient } from 'redis';
import { promisify } from 'util';

const client = createRedisClient(process.env.REDISCLOUD_URL, {no_ready_check: true});
const getAsync = promisify(client.get).bind(client);

export const getConfig = async (id) => {
    return JSON.parse(await getAsync(id));
  };
  
export const saveConfig = (id, config) => {
    client.set(id, JSON.stringify(config, null, 2));
};

export const getDb = async (id) => {
    return await JSON.parse(await getAsync(id + '_db'));
};

export const saveDb = (id, db) => {
    client.set(id + '_db', JSON.stringify(db, null, 2));
};
  