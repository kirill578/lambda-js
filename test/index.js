import assert from 'assert';
import { executeCode } from '../server/codeExecutor'

describe('Third party code execution', function() {

    it('print to log', function() {
        let invoked = false;
        executeCode(`console.log("hello")`, {}, {}, {}, (msg) => {
            assert.equal(msg, "hello");
            invoked = true;
        });
        assert.equal(true, invoked);
    });

    it('db values can be read and changed', function() {
        let db = {
            key: {
                hello: 1
            }
        };
        executeCode(`db['key'] = { hello: db.key.hello + 1 };`, db, {}, {}, () => {});
        assert.equal(db.key.hello, 2);
    });

    it('timeout after 100 ms', async function() {
        let didError = false;
        try {
            executeCode(`while(true);`, {}, {}, {}, () => {});
        } catch (e) {
            didError = true;
            assert.equal(e.message, "Script execution timed out.");
        }
        assert.equal(true, didError);
    });

    it('read and params and return value', async function() {
        const output = executeCode(`return params.key;`, {}, { key: 'hello'}, {}, () => {});;
        assert.equal('hello', output);
    });

    it('read and body and return value', async function() {
        const output = executeCode(`return body.key;`, {}, {}, { key: 'hello'}, () => {});;
        assert.equal('hello', output);
    });

    it('code does not have access to node process', async function() {
        let didError = false;
        try {
            executeCode(`process.exit()`, {}, {}, {}, () => {});
        } catch (e) {
            didError = true;
            assert.equal(e.message, "process is not defined");
        }
        assert.equal(true, didError);
    });

});