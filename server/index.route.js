const express = require('express');
const userRoutes = require('./api/user/user.route');
const authRoutes = require('./api/auth/auth.route');
const trainingsRoute = require('./api/training/training.route');


const router = express.Router(); // eslint-disable-line new-cap

// TODO: use glob to match *.route files


router.get('/status', (req, res) =>
    res.send('OK')
);

router.use('/users', userRoutes);

router.use('/auth', authRoutes);

router.use('/trainings', trainingsRoute);


module.exports = router;
