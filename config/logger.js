const { createLogger, format, transports } = require('winston');


// eslint-disable-next-line no-unused-vars
const msgFormatter = (info) => {
    let msg = '';
    if (info.res && info.res.statusCode) msg += ` - status[${info.res.statusCode}]`;
    if (info.res && info.res.body && info.res.body.apiErrorCode) msg += ` apiErrorCode=${info.res.body.apiErrorCode}`;
    if (info.req) msg += ` --> req: ${(info.req.body && JSON.stringify(info.req.body)) || 'none'}`;
    if (info.res && info.res.body) {
        const { res } = info;
        const { stack, message } = res.body;
        if (message) {
            msg += `  ==> message: [${message}]`;
            // delete res.body.message;
        } else {
            msg += `  ==> res: ${JSON.stringify(res.body)}`;
        }
        if (stack /* && stack.indexOf('at exports.converter') < 0 */) {
            msg += `\n\n${stack}`;
            // delete res.body.stack;
        }
    }
    const splat = info[Symbol.for('splat')];
    if (splat && splat[0] && !splat[0].req) {
        msg += splat;
    }
    return msg;
};

const logger = createLogger({
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.splat(),
        // format.simple(),
        format.printf(info => `${info.timestamp} - ${info.level} :: ${info.message}${msgFormatter(info)}`),
    ),
    transports: [
        new (transports.Console)({
            json: true,
            colorize: true,
        }),
    ],
});

module.exports = logger;
