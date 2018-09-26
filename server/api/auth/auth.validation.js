const Joi = require('joi');
const { reqValidationOptionsStrict } = require('../../../config/validation-consts');

module.exports = {
    regisger: {
        body: {
            nickName: Joi.string().required(),
            password: Joi.string().required(),
            firstName: Joi.string(),
            lastName: Joi.string(),
            // email: Joi.string(),
        },
        options: reqValidationOptionsStrict,
    },

    login: {
        body: {
            nickName: Joi.string().required(),
            password: Joi.string().required(),
        },
        /*
        query: {
            shunra: Joi.string().required(),
        },
        */
        options: reqValidationOptionsStrict,
    },

    changePassword: {
        /*
        params: {
            userId: Joi.string().hex().required(),
        },
        */
        body: {
            nickName: Joi.string().required(),
            oldPassword: Joi.string().required(),
            newPassword: Joi.string().required(),
        },
        options: reqValidationOptionsStrict,
    },
};
