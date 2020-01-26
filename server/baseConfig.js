import uuid from 'uuid';

export const createBaseConfig = () => [
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
  }, {
    "id": uuid(),
    "baseUrl": "/500",
    "method": "GET",
    "code":
      `// process is undefined
  process.exit()`
  },
];