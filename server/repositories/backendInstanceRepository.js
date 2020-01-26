import { BaseRedisRepository } from './baseRepository';
import { redisClient, getAsync } from './redis';

class BackendInstanceRepository extends BaseRedisRepository {
    constructor(redisClient) {
        super(redisClient);
    }

    saveInstance(instanceId, configuration) {
        this.redisClient.set(instanceId, JSON.stringify(configuration, null, 2));
    }

    async getInstanceById(instanceId) {
        return JSON.parse(await getAsync(this.redisClient)(instanceId));
    }
}

export const backendInstanceRepository = new BackendInstanceRepository(redisClient);