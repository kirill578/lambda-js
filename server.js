const express = require('express');
const path = require('path');
const {VM} = require('vm2');
const uuid = require('uuid');
const app = express();
const port = process.env.PORT || 5000;
const socketIO = require('socket.io');

const redis = require('redis');
const client = redis.createClient(process.env.REDISCLOUD_URL, {no_ready_check: true});
const {promisify} = require('util');
const getAsync = promisify(client.get).bind(client);

const bodyParser = require('body-parser');

app.use(bodyParser.json());


const baseConfig = [
  {
    "id": uuid(),
    "baseUrl": "/hello",
    "method": "GET",
    "code":
`const str = "hello world";
console.log(str);
return str;`
  },
  {
    "id": uuid(),
    "baseUrl": "/db",
    "method": "GET",
    "code":
`
console.log('Request with GET param: ?id=' + params.id);
const value = db[params.id];
console.log('Returning' + JSON.stringify(value));
return value;`
  },
  {
    "id": uuid(),
    "baseUrl": "/db",
    "method": "PUT",
    "code":
`console.log('Request to update id=' + params.id + ' with ' + JSON.stringify(body));
  
db[params.id] = {...db[params.id], ...body};
console.log('Returning updated: ' + JSON.stringify(db[params.id]);
  
return db[params.id];`
  },{
    "id": uuid(),
    "baseUrl": "/500",
    "method": "GET",
    "code":
`// process is undefined
process.exit()`
  },
];

const getConfig = async (id) => {
  return JSON.parse(await getAsync(id));
};

const saveConfig = (id, config) => {
  client.set(id, JSON.stringify(config, null, 2));
};

const getDb = async (id) => {
  return await JSON.parse(await getAsync(id + '_db'));
};

const saveDb = (id, db) => {
  client.set(id + '_db', JSON.stringify(db, null, 2));
};

const asyncMiddleware = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};


client.get('redis_alive', (err, value) => {
  if (!value) {
    client.set('redis_alive', new Date().getTime());
  }
});

app.get('/status', asyncMiddleware(async (req, res) => {
  res.set({'Content-Type': 'application/json'});
  res.send({redis: {
      lifetime: (new Date().getTime() - (await getAsync('redis_alive')))
    }})
}));

const configMatcher = /^\/config\/([a-z-]+)\.json$/;

app.post(configMatcher, (req, res) => {
  res.set({'Content-Type': 'application/json'});
  const apiId = req.params[0];
  saveConfig(apiId, req.body);
  res.status(200).send({});


  io.sockets.in(apiId).emit('log', '== Endpoints updated ==');
  req.body.forEach((endpoint) => {
    io.sockets.in(apiId).emit('log', endpoint.method + ' ' + req.protocol  + '://' + req.headers.host + '/api/' + apiId + endpoint.baseUrl);
  });
});

app.get(configMatcher, asyncMiddleware(async (req, res) => {
  res.set({'Content-Type': 'application/json'});
  const apiId = req.params[0];
  let config = await getConfig(apiId);
  if (!config) {
    config = baseConfig;
    saveConfig(apiId, config);
  }
  res.send(config);
}));

const matcher = /^\/api\/([a-z-]+)(\/?[^?]*)\??.*/;

const multiHandler = asyncMiddleware(async (req, res) => {
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
        io.sockets.in(apiId).emit('log', msg);
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
    io.sockets.in(apiId).emit('log', e.toString());
    res.status(500).send();
    return;
  }
});

app.get(matcher, multiHandler);
app.post(matcher, multiHandler);
app.put(matcher, multiHandler);
app.delete(matcher, multiHandler);

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));
  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

const server = app.listen(port, () => console.log(`Listening on port ${port}`));

const io = socketIO(server);
io.sockets.on('connection', function(socket) {
  socket.on('room', function(room) {
    socket.join(room);
  });
});