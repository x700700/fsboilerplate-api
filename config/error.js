const httpStatus = require('http-status');
const expressValidation = require('express-validation');
const APIError = require('./APIError');
const logger = require('./logger');
const config = require('../config/config');


// eslint-disable-next-line no-unused-vars
const handler = (err, req, res, next) => {
    // Send stacktrace only during development
    res.status(err.status).json({
        status: err.status,
        message: err.isPublic && err.message ? err.message : httpStatus[err.status],
        isPublic: err.isPublic || false,
        apiErrorCode: err.apiErrorCode || -1,
        stack: config.env === 'development' && err.name !== 'APIError' ? err.stack : undefined,
    });
};
exports.handler = handler;


exports.converter = (err, req, res, next) => {
    let error = err;
    if (err instanceof expressValidation.ValidationError) {
        const unifiedErrorMessage = err.errors.map(e => `${e.location}: ${e.messages.join('. ')}`).join(' ; ');
        error = new APIError(unifiedErrorMessage, err.status, { apiErrorCode: -4 });
    } else if (!(err instanceof APIError)) {
        error = new APIError(err.message, err.status, { isPublic: err.isPublic || true, apiErrorCode: -1 });
    }
    logger.error(error);
    return next(error);
};


exports.notFound = (req, res, next) => {
    const err = new APIError('API Not Found', httpStatus.NOT_FOUND, { isPublic: false });
    return next(err);
};
