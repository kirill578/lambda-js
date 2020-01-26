import { BaseRedisRepository } from './baseRepository';
import { redisClient, getAsync } from './redis';

class AccessLogRepository extends BaseRedisRepository {
    constructor(redisClient) {
        super(redisClient);
    }

    async addRecord(instanceId, accessRecord) {
        const newRecords = [...(await this.getRecordsById(instanceId)), accessRecord];
        this.redisClient.set(instanceId + "_access_log", JSON.stringify(newRecords, null, 2));
    }

    async getRecordsById(instanceId) {
        try {
            const arr = JSON.parse(await getAsync(this.redisClient)(instanceId + "_access_log"));
            if (arr) {
                return arr;
            } else {
                return [];
            }
        } catch (e) {
            return [];
        }
    }
}

export const accessLogRepository = new AccessLogRepository(redisClient);