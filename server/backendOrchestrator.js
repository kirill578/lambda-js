import { backendInstanceRepository, backendInstanceStorageRepository } from './repositories'
import {asyncMiddleware} from './utils';
import { sendRemoteLog } from './remoteLogger';
import { logAccessEvent } from './accessLogger';
import { executeCode } from './codeExecutor';

const matcher = /^\/api\/([a-z-]+)(\/?[^?]*)\??.*/;

export const registerBackendOrchestrator = (app) => {
    app.get(matcher, orchestrationHandler);
    app.post(matcher, orchestrationHandler);
    app.put(matcher, orchestrationHandler);
    app.delete(matcher, orchestrationHandler);
}

const orchestrationHandler = asyncMiddleware(async (req, res) => {
    res.set({'Content-Type': 'application/json'});
  
    const apiId = req.params[0];
    const baseUrl = req.params[1];

    logAccessEvent(apiId, req);
  
    const endpoints = await backendInstanceRepository.getInstanceById(apiId);
    if (!endpoints) {
      res.status(502).send({error: 'base url is not defined'});
      return;
    }
  
    const endpoint = endpoints.find(endpoint => endpoint.method === req.method && endpoint.baseUrl === baseUrl);
  
    if (!endpoint) {
      res.status(502).send({error: 'no endpoint defined'});
      return;
    }
  
    let db;
    try {
      db = await backendInstanceStorageRepository.getStorageByInstanceId(apiId);
      if (!db) {
        db = {};
      }
    } catch (e) {
      db = {};
    }
  
    try {
      const output = executeCode(endpoint.code, db, req.query, req.body, (msg) => {
        sendRemoteLog(apiId, msg);
      });
      
      backendInstanceStorageRepository.saveStorage(apiId, db);
  
      res.send(JSON.stringify(output));
    } catch (e) {
      console.error(e);
      sendRemoteLog(apiId, e.toString());
      res.status(500).send();
      return;
    }

  });


