const passport = require('passport');
const bcrypt = require('bcrypt-nodejs');
const LocalStrategy = require('passport-local').Strategy;
const httpStatus = require('http-status');
const APIError = require('./APIError');
const User = require('../server/model/user.model');


// source: https://medium.com/@evangow/server-authentication-basics-express-sessions-passport-and-curl-359b7456003d

passport.use(new LocalStrategy(
    { usernameField: 'nickName' },
    (nickName, password, done) => {
        return User.findOne({ nickName: { $regex: new RegExp(`^${nickName.toLowerCase()}`, 'i') } })
            .then((user) => {
                if (!user) {
                    return done(new APIError('Bad credentials', httpStatus.UNAUTHORIZED), null);
                }
                if (!bcrypt.compareSync(password, user.passwordHash)) {
                    return done(new APIError('Bad credentials', httpStatus.UNAUTHORIZED), null);
                }
                return done(null, user);
            })
            .catch(e => done(e, null));
    },
));


// tell passport how to serialize the user
passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser((id, done) => {
    return User.get(id)
        .then((user) => {
            if (user) {
                return done(null, user);
            } else {
                return done(new APIError("deserializeUser didn't find user", httpStatus.UNAUTHORIZED), null);
            }
        })
        .catch(e => done(e));
});

module.exports = passport;
