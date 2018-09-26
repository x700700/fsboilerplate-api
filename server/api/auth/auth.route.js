const express = require('express');
const validate = require('express-validation');
const auth = require('../../../config/auth');
const authValidation = require('./auth.validation');
const authCtrl = require('./auth.controller');


const router = express.Router(); // eslint-disable-line new-cap


router.route('/register')

    // POST /auth/register - Register
    .post(validate(authValidation.regisger), authCtrl.register); // Todo GDPR - prevent massive attack for all non-auth routes (such as this)

router.route('/login')

    // POST /auth/login - Login
    .post(validate(authValidation.login), authCtrl.login);

router.route('/check')

    // GET /auth/check - Check user is logged in
    .get(auth.requiresLogin, authCtrl.check);

router.route('/logout')

    // GET /auth/logout - Logout
    .get(auth.requiresLogin, authCtrl.logout);

router.route('/change-password')

// POST /auth/change-password - Change password
    .post(auth.requiresLogin, validate(authValidation.changePassword), authCtrl.changePassword);

// Todo - Forgot Password - in: mail, name -> change password to random, login, and send cookie + new password

module.exports = router;
