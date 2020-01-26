import { BaseRedisRepository } from './baseRepository';
import { redisClient, getAsync } from './redis';

class HashedInstancePasswordRepository extends BaseRedisRepository {
    constructor(redisClient) {
        super(redisClient);
    }

    setHashedPassword(instanceId, hashedPassword) {
        this.redisClient.set(instanceId + "_hashed_password", hashedPassword);
    }

    async getHashedPassword(instanceId) {
        return await getAsync(this.redisClient)(instanceId + "_hashed_password");
    }
}

export const hashedInstancePasswordRepository = new HashedInstancePasswordRepository(redisClient);