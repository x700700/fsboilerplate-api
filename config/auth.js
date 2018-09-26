const httpStatus = require('http-status');
const APIError = require('./APIError');
const logger = require('./logger');


exports.requiresLogin = (req, res, next) => {
    if (req.isAuthenticated()) {
        const { user } = req;
        logger.info(`HTTP origin [${user.nickName}] req: ${req.originalUrl}`);
        return next();
    } else {
        logger.error(`Unauthenticated request origin [${req.ip}] - req: ${req.originalUrl}`);
        return next(new APIError('Please sign in.', httpStatus.UNAUTHORIZED));
    }
};
