const User = require('../../model/user.model');
const Training = require('../../model/training.model');


exports.get = (req, res) => res.json(req.user);

// Todo - move to auth (userId is not sent)
exports.update = (req, res, next) => {
    const { user } = req;
    // User.findOneAndUpdate({ nickName: user.nickName }, User.getUpdated(req.body), { new: true })
    return user.update(User.getUpdated(req.body))
        .then(() => {
            User.get(user.id)
                .then(updatedUser => res.json(updatedUser.toObj()))
                .catch(e => next(e));
        })
        .catch(e => next(e));
};

// Todo - move to auth (userId is not sent)
exports.remove = (req, res, next) => {
    const { user } = req;
    return Training.deleteMany({ userId: user._id })
        .exec()
        .then(() => {
            req.logout();
            return user.remove()
                .then(deletedUser => res.json(deletedUser.toObj()))
                .catch(e => next(e));
        })
        .catch(e => next(e));
};
