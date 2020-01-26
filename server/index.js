import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import { registerBackendOrchestrator } from './backendOrchestrator';
import { registerBackendConfigurationEndpoints } from './backendConfigurationEndpoints';
import { registerRemoteLogger } from './remoteLogger'
import { registerCsvAccessLogGenerator } from './accessLogger'

const app = express();
app.use(bodyParser.json());
const port = process.env.PORT || 5000;

registerBackendOrchestrator(app);
registerBackendConfigurationEndpoints(app);
registerCsvAccessLogGenerator(app);

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));
  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

const server = app.listen(port, () => console.log(`Listening on port ${port}`));

registerRemoteLogger(server)