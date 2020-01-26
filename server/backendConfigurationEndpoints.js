
import {asyncMiddleware} from './utils';
import { saveConfig, getConfig } from './db';
import { createBaseConfig } from './baseConfig';
import { sendRemoteLog } from './remoteLogger';

const configMatcher = /^\/config\/([a-z-]+)\.json$/;

export const registerBackendConfigurationEndpoints = (app) => {

    app.post(configMatcher, (req, res) => {
        res.set({'Content-Type': 'application/json'});
        const apiId = req.params[0];
        saveConfig(apiId, req.body);
        res.status(200).send({});


        sendRemoteLog(apiId, '== Endpoints updated ==');
        req.body.forEach((endpoint) => {
            sendRemoteLog(apiId, endpoint.method + ' ' + req.protocol  + '://' + req.headers.host + '/api/' + apiId + endpoint.baseUrl);
        });
    });

    app.get(configMatcher, asyncMiddleware(async (req, res) => {
        res.set({'Content-Type': 'application/json'});
        const apiId = req.params[0];
        let config = await getConfig(apiId);
        if (!config) {
            config = createBaseConfig();
            saveConfig(apiId, config);
        }
        res.send(config);
    }));

}
