export class BaseRedisRepository {
    constructor(redisClient) {
        this.redisClient = redisClient;
    }
}