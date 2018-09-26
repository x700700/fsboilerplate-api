const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../../../config/APIError');
const Exercise = require('../../model/exercise.model');
// const logger = require('../../config/logger');

const exerciseModel = mongoose.model('exercise', Exercise);


exports.load = (req, res, next, id) => {
    req.exerciseId = id;
    return next();
};


exports.create = (req, res, next) => {
    const { training } = req;
    const exercise = new exerciseModel({});
    training.exercises.push(exercise);
    return training.save()
        .then(updatedTraining => res.json(updatedTraining.exercises.id(exercise.id).toObj(training)))
        .catch(e => next(e));
};

exports.update = async (req, res, next) => {
    const { training, exerciseId } = req;
    const exercise = training.exercises.id(exerciseId);
    if (!exercise) {
        return next(new APIError('Exercise was not found for this training', httpStatus.NOT_FOUND));
    }
    exercise.question = req.body.question;
    exercise.answer = req.body.answer;
    return training.save()
        .then(() => res.json(exercise.toObj(training)))
        .catch(e => next(e));
};

exports.remove = (req, res, next) => {
    const { training, exerciseId } = req;
    const exercise = training.exercises.id(exerciseId);
    if (!exercise) {
        return next(new APIError('Exercise was not found for this training', httpStatus.NOT_FOUND));
    }
    const result = exercise.toObj(training);
    exercise.remove();
    return training.save()
        .then(() => res.json(result))
        .catch(e => next(e));
};
