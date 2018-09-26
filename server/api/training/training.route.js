const express = require('express');
const validate = require('express-validation');
const auth = require('../../../config/auth');
const trainingValidation = require('./training.validation');
const exerciseValidation = require('../exercise/exercise.validation');
const trainingCtrl = require('./training.controller');
const exerciseCtrl = require('../exercise/exercise.controller');


const router = express.Router(); // eslint-disable-line new-cap

router.route('/')

    // POST /trainings/ - Create new training
    .post(auth.requiresLogin, trainingCtrl.create)

    // GET /trainings/ - Find all user trainings
    .get(auth.requiresLogin, trainingCtrl.list);



router.param('trainingId', trainingCtrl.load);
router.route('/:trainingId')

    // GET /trainings/:trainingId/ - Get a training
    .get(auth.requiresLogin, validate(trainingValidation.getTraining), trainingCtrl.get)

    // PUT /trainings/:trainingId/ - Update a training
    .put(auth.requiresLogin, validate(trainingValidation.updateTraining), trainingCtrl.update)

    // DELETE /trainings/:trainingId/ - Delete a training
    .delete(auth.requiresLogin, trainingCtrl.remove);


router.route('/:trainingId/exercises')
    // POST /trainings/:id/exercises - Create new exercise
    .post(auth.requiresLogin, exerciseCtrl.create);



router.param('exerciseId', exerciseCtrl.load);
router.route('/:trainingId/exercises/:exerciseId')

    // POST /trainings/:id/exercises/:id - Update an exercise
    .put(auth.requiresLogin, validate(exerciseValidation.updateExercise), exerciseCtrl.update)

    // DEL /trainings/:id/exercises/:id - Delete an exercise
    .delete(auth.requiresLogin, exerciseCtrl.remove);



module.exports = router;
