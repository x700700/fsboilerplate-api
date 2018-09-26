const httpStatus = require('http-status');
const bcrypt = require('bcrypt-nodejs');
const logger = require('../../../config/logger');
const APIError = require('../../../config/APIError');
const passport = require('../../../config/passport');
const User = require('../../model/user.model');


const isNicknameFree = async (nickName) => {
    return User.findOne({ nickName: { $regex: new RegExp(`^${nickName.toLowerCase()}`, 'i') } })
        .then(user => !user)
        .catch(() => true);
};

exports.register = async (req, res, next) => {
    if (await isNicknameFree(req.body.nickName)) {
        const user = User.getNew(req.body);
        return user.save()
            .then(savedUser => res.json(savedUser.toObj()))
            .catch(e => next(e));
    }
    return next(new APIError('Nick name is laready taken.', httpStatus.IM_USED));
};

// eslint-disable-next-line no-unused-vars
exports.check = (req, res, next) => {
    const { user } = req;
    return res.json(user.toObj());
};

exports.login = (req, res, next) => {
    // eslint-disable-next-line consistent-return
    passport.authenticate('local', (err, user) => {
        if (err) {
            req.logout();
            logger.error(err);
            return res.status(httpStatus.UNAUTHORIZED).send(err.message);
        }
        if (!user) {
            logger.error('no user found');
            return res.status(httpStatus.UNAUTHORIZED).send('Missing user credentials');
        }
        req.login(user, (error) => {
            if (error) {
                req.logout();
                logger.error(error);
                return res.status(httpStatus.UNAUTHORIZED).send(error);
            }
            return res.json(user.toObj());
        });
    })(req, res, next);
};


exports.logout = (req, res) => {
    req.logout();
    return res.json({ status: 'OK' });
};


exports.changePassword = (req, res, next) => {
    const { nickName, oldPassword, newPassword } = req.body;
    const { user } = req;
    if (!user) {
        throw new APIError('no authenticated user', httpStatus.UNAUTHORIZED);
    }
    if (user.nickName !== nickName) {
        throw new APIError('Bad Credentials', httpStatus.UNAUTHORIZED);
    }
    if (!bcrypt.compareSync(oldPassword, user.passwordHash)) {
        throw new APIError('Bad Credentials', httpStatus.UNAUTHORIZED);
    }
    // eslint-disable-next-line no-param-reassign
    user.passwordHash = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(8), null);
    return user.save()
        .then(savedUser => res.json(savedUser.toObj()))
        .catch(e => next(e));
};
