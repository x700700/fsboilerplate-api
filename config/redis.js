const Redis = require('ioredis');
const config = require('../config/config');
const logger = require('./logger');


const redis = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    retryStrategy: (times) => {
        logger.info(`Redis down. retry #${times}`);
        return Math.min(times * 1000, 3000);
    },
    maxRetriesPerRequest: 1,
});

module.exports = redis;
