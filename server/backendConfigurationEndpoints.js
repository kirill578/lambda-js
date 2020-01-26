
import { asyncMiddleware } from './utils';
import { backendInstanceRepository } from './repositories'
import { createBaseConfig } from './baseConfig';
import { sendRemoteLog } from './remoteLogger';

const configMatcher = /^\/config\/([a-z-]+)\.json$/;

export const registerBackendConfigurationEndpoints = (app) => {

    app.post(configMatcher, (req, res) => {
        res.set({'Content-Type': 'application/json'});
        const apiId = req.params[0];
        backendInstanceRepository.saveInstance(apiId, req.body);
        res.status(200).send({});


        sendRemoteLog(apiId, '== Endpoints updated ==');
        req.body.forEach((endpoint) => {
            sendRemoteLog(apiId, endpoint.method + ' ' + req.protocol  + '://' + req.headers.host + '/api/' + apiId + endpoint.baseUrl);
        });
    });

    app.get(configMatcher, asyncMiddleware(async (req, res) => {
        res.set({'Content-Type': 'application/json'});
        const apiId = req.params[0];
        let config = await backendInstanceRepository.getInstanceById(apiId);
        if (!config) {
            config = createBaseConfig();
            backendInstanceRepository.saveInstance(apiId, config);
        }
        res.send(config);
    }));

}
