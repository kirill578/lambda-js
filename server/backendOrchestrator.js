import { VM } from 'vm2';
import {getConfig, getDb, saveDb} from './db';
import {asyncMiddleware} from './utils';
import { sendRemoteLog } from './remoteLogger';

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
  
    const endpoints = await getConfig(apiId);
    if (!endpoints) {
      res.status(502).send({error: 'base url is not defined'});
      return;
    }
  
    const endpoint = endpoints.find(endpoint => endpoint.method === req.method && endpoint.baseUrl === baseUrl);
  
    if (!endpoint) {
      res.status(502).send({error: 'no endpoint defined'});
      return;
    }
  
    const context = {
      params: req.query,
      body: req.body,
      console: {
        log: (msg) => {
          sendRemoteLog(apiId, msg);
        }
      }
    };
  
    try {
      context.db = await getDb(apiId);
      if (!context.db) {
        context.db = {};
      }
    } catch (e) {
      context.db = {};
    }
  
    const vm = new VM({
      timeout: 100,
      sandbox: context
    });
  
    try {
      const output = vm.run("const func = function (db, params, body, console) { "
          + endpoint.code + " }; func(db, params, body, console)");
  
      saveDb(apiId, context.db);
  
      res.send(JSON.stringify(output));
    } catch (e) {
      sendRemoteLog(apiId, e.toString());
      res.status(500).send();
      return;
    }
  });