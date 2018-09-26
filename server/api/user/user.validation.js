const Joi = require('joi');
const { reqValidationOptionsStrict } = require('../../../config/validation-consts');


    module.exports = {

    updateUser: {
        body: {
            nickName: Joi.string(),
            firstName: Joi.string(),
            lastName: Joi.string(),
        },
        options: reqValidationOptionsStrict,
    },
};
