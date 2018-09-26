/* eslint-disable no-console */
const express = require('express');
const session = require('express-session');
const redisStore = require('connect-redis')(session);
const helmet = require('helmet');
const expressWinston = require('express-winston');
const methodOverride = require('method-override');
const compress = require('compression');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const uuid = require('uuid/v4');
const morgan = require('morgan');
const passport = require('./passport');
const winstonInstance = require('./logger');
const routes = require('../server/index.route');
const config = require('../config/config');
const redis = require('./redis');
const error = require('./error');
// const cors = require('cors');


const app = express();
const redisStoreInstance = new redisStore({ client: redis, ttl: 260, /* logErrors: true */ });


// eslint-disable-next-line no-constant-condition
if (true || config.env === 'development') {
    app.use(morgan('dev')); // init logger
}

const allowedOrigins = [
    // Dev
    'http://dev.fsboilerplate.com:3000',

    // Prod
    'http://fsboilerplate.com',
];
app.use((req, res, next) => {
    const { origin } = req.headers;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    }
    next();
});


// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(compress());
app.use(methodOverride());

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
// app.use(cors()); // Todo - Disabled, since session cookie is not sent to React when enabled.


app.use(session({
    // eslint-disable-next-line no-unused-vars
    genid: (req) => {
        // console.log(`session.genid - sessionID: ${req.sessionID}`);
        return uuid();
    },
    store: redisStoreInstance,
    secret: 'bo0liwRotEverrr4al1i1',
    rolling: true,
    resave: true,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 120,
    },
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); // use connect-flash for flash messages stored in session



if (config.env === 'development') {
    expressWinston.requestWhitelist.push('body');
    expressWinston.responseWhitelist.push('body');
    app.use(expressWinston.logger({
        winstonInstance,
        meta: true, // optional: log meta data about request (defaults to true)
        colorStatus: true, // Color the status code (default green, 3XX cyan, 4XX yellow, 5XX red).
        // msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms  -->  {{JSON.stringify(req.body)}} ==> {{JSON.stringify(res.body)}}',
    }));
}

// mount all routes on /api path
app.use('/', routes);


// if error is not an instanceOf APIError, convert it.
app.use(error.converter);

// catch 404 and forward to error handler
app.use(error.notFound);

// error handler, send stacktrace only during development
app.use(error.handler);


// log error in winston transports except when executing test suite
if (config.env !== 'test') {
    /* app.use(expressWinston.errorLogger({
        winstonInstance
    })); */
}

module.exports = app;
