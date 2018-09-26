const util = require('util');
const mongoose = require('mongoose');
const config = require('./config/config');
const logger = require('./config/logger');
const app = require('./config/express');


// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign

// plugin bluebird promise in mongoose
mongoose.Promise = Promise;

// Todo - Add cache to mongoose

// connect to mongo db
const mongoUri = `mongodb://${config.mongo.username}:${config.mongo.password}@${config.mongo.host}:${config.mongo.port}/${config.mongo.db}`;
mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    poolSize: 2,
    // ssl: true, // Todo - set on in prod
    keepAlive: 300000,
    connectTimeoutMS: 30000,
    autoReconnect: true,
    reconnectTries: 300000,
    reconnectInterval: 5000,
    promiseLibrary: global.Promise,
});
mongoose.connection.on('error', () => {
    throw new Error(`unable to connect to database: ${mongoUri}`);
});
logger.info(`Mongoose is connected to ${mongoUri}`);


// print mongoose logs in dev env
if (config.mongooseDebug) {
    mongoose.set('debug', (collectionName, method, query, doc, options) => {
        const opts = options ? ` opts[${JSON.stringify(options)}]` : '';
        logger.info(`mongoose - ${collectionName}.${method}${opts}`, JSON.stringify(util.inspect(query, false, 20)), JSON.stringify(doc));
    });
}


// module.parent check is required to support mocha watch
// src: https://github.com/mochajs/mocha/issues/1912
if (!module.parent) {
    app.listen(config.port, () => {
        logger.info(`server started on port ${config.port} (${config.env})`); // eslint-disable-line no-console
    });
}

module.exports = app;
