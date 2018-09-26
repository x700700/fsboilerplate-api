/* eslint-disable func-names */
const Promise = require('bluebird');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const httpStatus = require('http-status');
const APIError = require('../../config/APIError');


// Todo GDPR - encrypt db

const UserSchema = new mongoose.Schema({
    /*
    email: {
        type: String,
        unique: true,
        required: true,
        index: true,
    },
    */
    nickName: {
        type: String,
        unique: true,
        required: true,
        index: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        // required: true,
    },
    lastName: {
        type: String,
        // required: true,
    },
    createdAt: {
        type: Date,
    },
    modifiedAt: {
        type: Date,
    },
});


UserSchema.pre('save', function (next) {
    this.createdAt = Date.now();
    this.modifiedAt = null;
    next();
});
UserSchema.pre('update', function (next) {
    this.update({
        modifiedAt: Date.now(),
    });
    next();
});
UserSchema.pre('findOneAndUpdate', function (next) {
    this.update({
        modifiedAt: Date.now(),
    });
    next();
});


UserSchema.method({
    toObj() {
        return {
            // email: this.email,
            nickName: this.nickName,
            firstName: this.firstName,
            lastName: this.lastName,
            info: {
                id: this._id,
                createdAt: this.createdAt,
                modifiedAt: this.modifiedAt,
            },
        };
    },
});


UserSchema.statics = {
    get(id) {
        try {
            return this.findById(id)
                .exec()
                .then((user) => {
                    if (user) {
                        return user;
                    }
                    throw new APIError('No such user exists!', httpStatus.NOT_FOUND, { isPublic: false });
                });
        } catch (err) {
            return Promise.reject(err);
        }
    },
    getNew(obj) {
        return new this({
            // email: obj.email,
            passwordHash: bcrypt.hashSync(obj.password, bcrypt.genSaltSync(8), null),
            nickName: obj.nickName,
            firstName: obj.firstName,
            lastName: obj.lastName,
        });
    },
    getUpdated(obj) {
        const { nickName, firstName, lastName } = obj;
        const user = {};
        if (nickName) user.nickName = nickName;
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        return user;
    }
};


module.exports = mongoose.model('users', UserSchema);
