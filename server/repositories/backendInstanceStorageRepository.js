import { BaseRedisRepository } from './baseRepository';
import { redisClient, getAsync } from './redis';

class BackendInstanceStorageRepository extends BaseRedisRepository {
    constructor(redisClient) {
        super(redisClient);
    }

    async getStorageByInstanceId(instanceId) {
        return JSON.parse(await getAsync(this.redisClient)(instanceId + '_db'));
    }

    saveStorage(instanceId, configuration) {
        this.redisClient.set(instanceId + '_db', JSON.stringify(configuration, null, 2));
    }
    
}

export const backendInstanceStorageRepository = new BackendInstanceStorageRepository(redisClient);