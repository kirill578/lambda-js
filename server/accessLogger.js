import { accessLogRepository } from './repositories'
import { asyncMiddleware } from './utils';

export const logAccessEvent = async (apiId, req) => {
    await accessLogRepository.addRecord(apiId, {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        ip: req.connection.remoteAddress,
    });
}

const configMatcher = /^\/access_log\/([a-z-]+)\.csv$/;

export const registerCsvAccessLogGenerator = (app) => {
    app.get(configMatcher, asyncMiddleware(async (req, res) => {
        res.set({'Content-Type': 'text/csv'});
        const apiId = req.params[0];
        const records = await accessLogRepository.getRecordsById(apiId);

        let csv = 'timestamp, method, path, ip,\n' 
            + records.map(({timestamp, method, path, ip}) => `${timestamp}, ${method}, ${path}, ${ip},`).join('\n');

        res.send(csv);
    }));
}

