export const asyncMiddleware = fn => (req, res, next) => {
    res.set({'Access-Control-Allow-Origin': '*'});
    Promise.resolve(fn(req, res, next)).catch(next);
};