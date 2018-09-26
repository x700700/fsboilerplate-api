const httpStatus = require('http-status');


class ExtendableError extends Error {
    constructor(message, status, isPublic, apiErrorCode) {
        super(message);
        this.name = this.constructor.name;
        this.message = message;
        this.apiErrorCode = apiErrorCode;
        this.status = status;
        this.isPublic = isPublic;
        this.isOperational = true; // This is required since bluebird 4 doesn't append it anymore.
        Error.captureStackTrace(this, this.constructor.name);
    }
}

class APIError extends ExtendableError {
    constructor(message, status = httpStatus.INTERNAL_SERVER_ERROR, meta) {
        const { apiErrorCode = -2, isPublic = true } = meta || {};
        super(message, status, isPublic, apiErrorCode);
    }
}

module.exports = APIError;
