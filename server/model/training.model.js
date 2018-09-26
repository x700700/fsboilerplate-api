/* eslint-disable func-names */
const _ = require('lodash');
const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../../config/APIError');
const { ExerciseSchema } = require('./exercise.model');


const TrainingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        required: true,
        index: true,
    },
    name: {
        type: String,
        index: true,
    },
    archived: {
        type: Boolean,
        default: false,
        index: true,
    },
    played: {
        type: Number,
        default: 0,
    },
    success_ratio: {
        type: Number,
        default: 0.0,
    },
    createdAt: {
        type: Date,
        index: true,
    },
    modifiedAt: {
        type: Date,
        index: true,
    },
    lastTrainedAt: {
        type: Date,
        index: true,
    },
    exercises: [ExerciseSchema],
});


TrainingSchema.pre('save', function (next) {
    this.modifiedAt = this.createdAt ? Date.now() : null;
    if (!this.createdAt) this.createdAt = Date.now();
    if (!this.lastTrainedAt) this.lastTrainedAt = null;
    next();
});
TrainingSchema.pre('update', function (next) {
    this.update({
        modifiedAt: Date.now(),
    });
    next();
});
TrainingSchema.pre('findOneAndUpdate', function (next) {
    this.update({
        modifiedAt: Date.now(),
    });
    next();
});


TrainingSchema.method({
    toObj(filterCb, options) {
        const self = this;
        let { exercises } = this;
        if (options && options.attachExercises) {
            if (filterCb) {
                exercises = _.reverse(this.exercises).filter(filterCb).slice(0, 1).map(e => e.toObj(self));
            } else {
                // exercises = _.keyBy(_.sortBy(exercises, 'createdAt').map(e => e.toObj(self)), 'id');
                exercises = _.keyBy(exercises.map(e => e.toObj(self)), 'id');
            }
        }
        const training = {
            id: this._id,
            name: this.name || '',
            created: this.createdAt,
            modified: this.modifiedAt,
            popularity: 4,
            difficulty: 2,
            exercisesCount: this.exercises.length,
            info: {
                userId: this.userId,
                archived: this.archived || false,
                lastTrainedAt: this.lastTrainedAt,
            },
        };
        if (options && options.attachExercises) {
            if (filterCb) {
                [training.sampleExercise] = exercises;
            } else {
                training.exercises = exercises;
            }
        }
        return training;
    },
});


TrainingSchema.statics = {
    get(id) {
        try {
            return this.findById(id)
                .exec()
                .then((training) => {
                    if (training) {
                        return training;
                    }
                    throw new APIError('No such training exists!', httpStatus.NOT_FOUND, { isPublic: false });
                });
        } catch (err) {
            return Promise.reject(err);
        }
    },
    list(user, { skip = 0, limit = 50 } = {}) {
        return this.find({ userId: user.id, archived: false })
            .sort({ createdAt: -1 })
            .skip(+skip)
            .limit(+limit)
            .exec();
    },
    getNew(user) {
        return new this({
            userId: user.id,
        });
    },
    getUpdated(obj) {
        const { name } = obj;
        const training = {};
        if (name) training.name = name;
        return training;
    },
    toList(trainings, filterCb) {
        return _.keyBy(trainings.map(t => t.toObj(filterCb, { attachExercises: true })), 'id');
    },
};

module.exports = mongoose.model('trainings', TrainingSchema);
