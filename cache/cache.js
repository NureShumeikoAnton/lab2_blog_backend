const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 0, checkperiod: 120 });

module.exports = {
    getFromCache: (key) => cache.get(key),
    setCache: (key, data) => cache.set(key, data),
    delCache: (key) => cache.del(key),
    flushAll: () => cache.flushAll()
}
