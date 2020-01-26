
import { asyncMiddleware } from './utils';
import { backendInstanceRepository } from './repositories';
import { logAccessEvent } from './accessLogger';
import { createBaseConfig } from './baseConfig';
import { sendRemoteLog } from './remoteLogger';
import { hashedInstancePasswordRepository } from './repositories';
import sha1 from 'js-sha1';

const configMatcher = /^\/config\/([a-z-]+)\.json$/;

export const registerBackendConfigurationEndpoints = (app) => {

    app.post(configMatcher, asyncMiddleware(async (req, res) => {
        res.set({'Content-Type': 'application/json'});
        const apiId = req.params[0];

        const isValid = await verifyPasswordIfNeeded(apiId, req, res);
        if (isValid) {
            updatePasswordIfNeeded(apiId, req, res);
        
            backendInstanceRepository.saveInstance(apiId, req.body);
            res.status(200).send({});
    
            logAccessEvent(apiId, req);
    
            sendRemoteLog(apiId, '== Endpoints updated ==');
            req.body.forEach((endpoint) => {
                sendRemoteLog(apiId, endpoint.method + ' ' + req.protocol  + '://' + req.headers.host + '/api/' + apiId + endpoint.baseUrl);
            });
        }
    }));

    app.get(configMatcher, asyncMiddleware(async (req, res) => {
        res.set({'Content-Type': 'application/json'});
        const apiId = req.params[0];

        logAccessEvent(apiId, req);

        const isValid = await verifyPasswordIfNeeded(apiId, req, res);
        if (isValid) {
            let config = await backendInstanceRepository.getInstanceById(apiId);
            if (!config) {
                config = createBaseConfig();
                backendInstanceRepository.saveInstance(apiId, config);
            }
            res.send(config);
        }
    }));

}

const verifyPasswordIfNeeded = async (apiId, req, res) => {
    const hashedPassword = await hashedInstancePasswordRepository.getHashedPassword(apiId);
    if (hashedPassword) {
        const password = req.headers['instance-password'];
        if (password) {
            if (sha1(password) !== hashedPassword) {
                res.status(403).send();
                return false;
            }
        } else {
            res.status(403).send();
            return false;
        }
    }
    return true;
}


const updatePasswordIfNeeded = async (apiId, req) => {
    const newPassword = req.headers['new-password'];
    const deletePassword = req.headers['delete-password'] === 'true';
    if (newPassword) {
        const newHashedPassword = sha1(newPassword);
        hashedInstancePasswordRepository.setHashedPassword(apiId, newHashedPassword);
    } else if (deletePassword) {
        hashedInstancePasswordRepository.setHashedPassword(apiId, null);
    }
}