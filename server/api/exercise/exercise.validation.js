const Joi = require('joi');
const { reqValidationOptionsStrict } = require('../../../config/validation-consts');


    module.exports = {

    updateExercise: {
        params: {
            trainingId: Joi.string().hex().required(),
            exerciseId: Joi.string().hex().required(),
        },
        body: {
            question: Joi.string().allow('').optional(),
            answer: Joi.string().allow('').optional(),
        },
        options: reqValidationOptionsStrict,
    },
};
