const Joi = require('joi');
const { reqValidationOptionsStrict } = require('../../../config/validation-consts');


    module.exports = {

        getTraining: {
            params: {
                trainingId: Joi.string().hex().required(),
            },
            options: reqValidationOptionsStrict,
        },

        updateTraining: {
            params: {
                trainingId: Joi.string().hex().required(),
            },
            body: {
                name: Joi.string(),
            },
            options: reqValidationOptionsStrict,
        },
};
