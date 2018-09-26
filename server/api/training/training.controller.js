const httpStatus = require('http-status');
const APIError = require('../../../config/APIError');
const Training = require('../../model/training.model');
// const logger = require('../../config/logger');


// eslint-disable-next-line consistent-return
exports.load = (req, res, next, id) => {
    if (!req.isAuthenticated()) {
        return next(new APIError('Please sign in.', httpStatus.UNAUTHORIZED));
    }
    return Training.get(id)
        .then((training) => {
            req.training = training; // eslint-disable-line no-param-reassign
            return next();
        })
        .catch(e => next(e));
};


exports.create = (req, res, next) => {
    const { user } = req;
    const training = Training.getNew(user);
    return training.save()
        .then(savedTraining => res.json(savedTraining.toObj()))
        .catch(e => next(e));
};

exports.update = async (req, res, next) => {
    const { training } = req;
    if (training.archived) return next(new APIError('Training is Archived', httpStatus.NOT_FOUND));
    try {
        await training.update(Training.getUpdated(req.body));
    } catch (e) {
        return next(e);
    }
    return Training.get(training.id)
        .then(updatedTraining => res.json(updatedTraining.toObj()))
        .catch(e => next(e));
};

exports.remove = async (req, res, next) => {
    const { training } = req;
    if (training.archived) return next(new APIError('Training is Archived', httpStatus.NOT_FOUND));
    try {
        await training.update({ archived: true });
    } catch (e) {
        return next(e);
    }
    return Training.get(training.id)
        .then(updatedTraining => res.json(updatedTraining.toObj()))
        .catch(e => next(e));
};
/*
exports.remove = (req, res, next) => {
    const { training } = req;
    return training.remove()
        .then(deletedTraining => res.json(deletedTraining.toObj()))
        .catch(e => next(e));
};
*/

const filtersampleExercise = e => (e.question && e.question !== '') || (e.answer && e.answer !== '');

exports.list = (req, res, next) => {
    const { user } = req;
    const { limit = 50, skip = 0 } = req.query;
    return Training.list(user, { limit, skip })
        .then((trainings) => {
            const result = Training.toList(trainings, filtersampleExercise);
            return res.json(result);
        })
        .catch(e => next(e));
};

// eslint-disable-next-line no-unused-vars
exports.get = async (req, res, next) => {
    const { training } = req;
    if (training.archived) return next(new APIError('Training is Archived', httpStatus.NOT_FOUND));
    return res.json(training.toObj(null, { attachExercises: true }));
};
