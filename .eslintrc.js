module.exports = {
    "env": {
        "es6": true,
        "node": true,
        "commonjs": true
    },
    "extends": "eslint:recommended",
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 8,
        "sourceType": "module"
    },
    "rules": {
        "no-console": false
    }
};