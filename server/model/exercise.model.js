/* eslint-disable func-names */
const mongoose = require('mongoose');


const ExerciseSchema = new mongoose.Schema({
    question: {
        type: String,
        default: '',
    },
    answer: {
        type: String,
        default: '',
    },
    played: {
        type: Number,
        default: 0,
    },
    wrongs: {
        type: Number,
        default: 0,
    },
    // Todo - chnage all dates' type to moment.unix
    createdAt: {
        type: Date,
    },
    modifiedAt: {
        type: Date,
    },
    lastTrainedAt: {
        type: Date,
    },
});


ExerciseSchema.pre('save', function (next) {
    if (!this.createdAt) this.createdAt = Date.now();
    this.modifiedAt = Date.now();
    if (!this.lastTrainedAt) this.lastTrainedAt = null;
    next();
});
ExerciseSchema.pre('update', function (next) {
    this.update({
        modifiedAt: Date.now(),
    });
    next();
});
ExerciseSchema.pre('findOneAndUpdate', function (next) {
    this.update({
        modifiedAt: Date.now(),
    });
    next();
});


ExerciseSchema.method({
    toObj(training) {
        return {
            id: this.id,
            trainingId: training.id,
            question: this.question,
            answer: this.answer,
            played: this.played,
            wrongs: this.wrongs,
            shouldReloadSampleExercises: true,
            info: {
                created: this.createdAt,
                modified: this.modifiedAt,
                lastTrainedAt: this.lastTrainedAt,
            },
        };
    },
});


ExerciseSchema.statics = {

};

exports.ExerciseSchema = ExerciseSchema;
