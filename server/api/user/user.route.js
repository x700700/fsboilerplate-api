const express = require('express');
const validate = require('express-validation');
const auth = require('../../../config/auth');
const userValidation = require('./user.validation');
const userCtrl = require('./user.controller');


const router = express.Router(); // eslint-disable-line new-cap

router.route('/')

    // PUT /users - Update user - Todo - move to auth
    .put(auth.requiresLogin, validate(userValidation.updateUser), userCtrl.update)

    // DELETE /users/ - Delete user - Todo - move to auth
    .delete(auth.requiresLogin, userCtrl.remove);

    // Todo - delete other users, alloewed only for user admin (for tests)

    // Todo - AreDetailsAvailable - email, nickName

module.exports = router;
