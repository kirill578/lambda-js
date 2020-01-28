import { VM } from 'vm2';

export const executeCode = (code, db, params, body, onLog) => {
    const context = {
      params,
      body,
      db,
      console: {
        log: onLog
      }
    };
  
  
    const vm = new VM({
      timeout: 100,
      sandbox: context
    });
  
    const output = vm.run("const func = function (db, params, body, console) { "
            + code + " }; func(db, params, body, console)");
  
    return output;
  }