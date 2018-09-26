const _ = require('lodash');
const mongoose = require('mongoose');
const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const chai = require('chai'); // eslint-disable-line import/newline-after-import
const { expect } = chai;
const app = require('../../index');
const utils = require('./utils');


chai.config.includeStack = true;

after((done) => {
    // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
    mongoose.models = {};
    mongoose.modelSchemas = {};
    mongoose.connection.close();
    done();
});


describe('## Training APIs', () => {
    const itemsId = Math.random().toString(36).substring(7);
    const password = 'Asdf12';
    let user = {
        nickName: `!!__test-${itemsId}`,
        password: password,
        firstName: `test-${itemsId}`,
        lastName: 'Weisstest',
    };
    // eslint-disable-next-line one-var-declaration-per-line,one-var
    let userId, cookies, newTraining1, newTraining2, exercise1, exercise2;


    describe('# POST /auth/register & login', () => {
        it('should register a new user', (done) => {
            request(app)
                .post('/auth/register')
                .send(user)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.nickName).to.equal(user.nickName);
                    user = res.body;
                    done();
                })
                .catch(done);
        });

        it('login', (done) => {
            request(app)
                .post('/auth/login')
                .send({
                    nickName: user.nickName,
                    password: password,
                })
                .expect(httpStatus.OK)
                .then((res) => {
                    cookies = utils.extractCookies(res);
                    userId = res.body.info.id;
                    done();
                })
                .catch(done);
        });
    });

    describe('# POST /trainings', () => {
        it('should crate a training', (done) => {
            const req = request(app).post('/trainings');
            req.cookies = cookies;
            req
                .expect(httpStatus.OK)
                .then((res) => {
                    newTraining1 = res.body;
                    expect(newTraining1).to.have.a.property('popularity');
                    expect(newTraining1).to.have.a.property('difficulty');
                    expect(newTraining1).to.have.a.property('exercisesCount');
                    expect(newTraining1.id).to.be.a('string');
                    expect(newTraining1.info.userId).to.equal(userId);
                    expect(newTraining1.info.archived).to.equal(false);
                    done();
                })
                .catch(done);
        });

        it('should update the training', (done) => {
            const req = request(app).put(`/trainings/${newTraining1.id}`);
            req.cookies = cookies;
            req
                .send({ name: 'test' })
                .expect(httpStatus.OK)
                .then((res) => {
                    newTraining1 = res.body;
                    expect(newTraining1.name).to.equal('test');
                    done();
                })
                .catch(done);
        });

        it('should crate a 2nd training', (done) => {
            const req = request(app).post('/trainings');
            req.cookies = cookies;
            req
                .expect(httpStatus.OK)
                .then((res) => {
                    newTraining2 = res.body;
                    expect(newTraining2.id).to.be.a('string');
                    expect(newTraining2.info.userId).to.equal(userId);
                    done();
                })
                .catch(done);
        });
        it('should update the 2nd training', (done) => {
            const req = request(app).put(`/trainings/${newTraining2.id}`);
            req.cookies = cookies;
            req
                .send({ name: 'test 2' })
                .expect(httpStatus.OK)
                .then((res) => {
                    newTraining2 = res.body;
                    expect(newTraining2.name).to.equal('test 2');
                    done();
                })
                .catch(done);
        });

    });

    describe('# POST /trainings/:id/exercises', () => {
        it('should crate exercise #1', (done) => {
            const req = request(app).post(`/trainings/${newTraining1.id}/exercises`);
            req.cookies = cookies;
            req
                .expect(httpStatus.OK)
                .then((res) => {
                    exercise1 = res.body;
                    expect(exercise1.id).to.be.a('string');
                    expect(exercise1.trainingId).to.be.a('string');
                    done();
                })
                .catch(done);
        });
        it('should update exercise #1', (done) => {
            const req = request(app).put(`/trainings/${newTraining1.id}/exercises/${exercise1.id}`);
            req.cookies = cookies;
            req
                .send({ question: 'who', answer: 'said' })
                .expect(httpStatus.OK)
                .then((res) => {
                    exercise1 = res.body;
                    expect(exercise1.question).to.equal('who');
                    expect(exercise1.answer).to.equal('said');
                    done();
                })
                .catch(done);
        });
        it('should crate exercise #2', (done) => {
            const req = request(app).post(`/trainings/${newTraining1.id}/exercises`);
            req.cookies = cookies;
            req
                .expect(httpStatus.OK)
                .then((res) => {
                    exercise2 = res.body;
                    done();
                })
                .catch(done);
        });
        it('should update exercise #2', (done) => {
            const req = request(app).put(`/trainings/${newTraining1.id}/exercises/${exercise2.id}`);
            req.cookies = cookies;
            req
                .send({ question: 'to', answer: 'whom' })
                .expect(httpStatus.OK)
                .then((res) => {
                    exercise2 = res.body;
                    expect(exercise2.question).to.equal('to');
                    expect(exercise2.answer).to.equal('whom');
                    done();
                })
                .catch(done);
        });

        it('should get all trainings with new exercises', (done) => {
            const req = request(app).get('/trainings');
            req.cookies = cookies;
            req
                .expect(httpStatus.OK)
                .then((res) => {
                    const training = res.body[newTraining1.id];
                    expect(training.sampleExercise.question).to.equal('to');
                    expect(training.sampleExercise.answer).to.equal('whom');
                    done();
                })
                .catch(done);
        }).timeout(5000);

        it('should get a training exercises', (done) => {
            const req = request(app).get(`/trainings/${newTraining1.id}`);
            req.cookies = cookies;
            req
                .expect(httpStatus.OK)
                .then((res) => {
                    const training = res.body;
                    const exercises = _.values(training.exercises);
                    expect(exercises).to.be.an('array');
                    expect(exercises).to.have.length(2);
                    expect(exercises[0].answer).to.equal('said');
                    done();
                })
                .catch(done);
        });

        it('should update the recent training', (done) => {
            const req = request(app).put(`/trainings/${newTraining1.id}`);
            req.cookies = cookies;
            req
                .send({ name: 'renamed after exercises added' })
                .expect(httpStatus.OK)
                .then((res) => {
                    newTraining1 = res.body;
                    expect(newTraining1.name).to.equal('renamed after exercises added');
                    expect(newTraining1).to.not.have.a.property('exercises');
                    done();
                })
                .catch(done);
        });

        it('should delete exercise #1', (done) => {
            const req = request(app).del(`/trainings/${newTraining1.id}/exercises/${exercise1.id}`);
            req.cookies = cookies;
            req
                .expect(httpStatus.OK)
                .then((res) => {
                    const exercise = res.body;
                    expect(exercise.question).to.equal('who');
                    expect(exercise.answer).to.equal('said');
                    done();
                })
                .catch(done);
        });

        it('should failed delete not found', (done) => {
            const req = request(app).del(`/trainings/${newTraining1.id}/exercises/${exercise1.id}`);
            req.cookies = cookies;
            req
                .expect(httpStatus.NOT_FOUND)
                .then(() => {
                    done();
                })
                .catch(done);
        });

    });

    describe('# GET /trainings', () => {
        it('should get all trainings', (done) => {
            const req = request(app).get('/trainings');
            req.cookies = cookies;
            req
                .expect(httpStatus.OK)
                .then((res) => {
                    const trainingsList = _.values(res.body);
                    expect(trainingsList).to.be.an('array');
                    expect(trainingsList).to.have.length(2);
                    done();
                })
                .catch(done);
        }).timeout(5000);

        it('should get all trainings (with limit and skip)', (done) => {
            const req = request(app).get('/trainings');
            req.cookies = cookies;
            req
                .query({ limit: 10, skip: 1 })
                .expect(httpStatus.OK)
                .then((res) => {
                    const trainingsList = _.values(res.body);
                    expect(trainingsList).to.be.an('array');
                    expect(trainingsList).to.have.length(1);
                    done();
                })
                .catch(done);
        });
    });

    describe('# DEL /trainings/:id', () => {
        it('should get all trainings', (done) => {
            const req = request(app).get('/trainings');
            req.cookies = cookies;
            req
                .expect(httpStatus.OK)
                .then((res) => {
                    const trainingsList = _.values(res.body);
                    expect(trainingsList).to.be.an('array');
                    expect(trainingsList).to.have.length(2);
                    done();
                })
                .catch(done);
        }).timeout(5000);

        it('should delete the 1st training', (done) => {
            const req = request(app).del(`/trainings/${newTraining1.id}`);
            req.cookies = cookies;
            req
                .expect(httpStatus.OK)
                .then((res) => {
                    const training = res.body;
                    expect(training.id).to.equal(newTraining1.id);
                    expect(training.info.archived).to.equal(true);
                    expect(training).to.not.have.a.property('exercises');
                    done();
                })
                .catch(done);
        });

        it('should get only one training', (done) => {
            const req = request(app).get('/trainings');
            req.cookies = cookies;
            req
                .expect(httpStatus.OK)
                .then((res) => {
                    const trainingsList = _.values(res.body);
                    expect(trainingsList).to.be.an('array');
                    expect(trainingsList).to.have.length(1);
                    done();
                })
                .catch(done);
        }).timeout(5000);

        it('should get trainings after deletion', (done) => {
            const req = request(app).get('/trainings');
            req.cookies = cookies;
            req
                .expect(httpStatus.OK)
                .then((res) => {
                    const trainingsList = _.values(res.body);
                    expect(trainingsList).to.be.an('array');
                    expect(trainingsList).to.have.length(1);
                    done();
                })
                .catch(done);
        }).timeout(5000);

        it('should failed delete training archived', (done) => {
            const req = request(app).del(`/trainings/${newTraining1.id}`);
            req.cookies = cookies;
            req
                .expect(httpStatus.NOT_FOUND)
                .then(() => {
                    done();
                })
                .catch(done);
        });

        it('should failed update training archived', (done) => {
            const req = request(app).put(`/trainings/${newTraining1.id}`);
            req.cookies = cookies;
            req
                .send({ name: 'test' })
                .expect(httpStatus.NOT_FOUND)
                .then(() => {
                    done();
                })
                .catch(done);
        });

    });


    describe('# DELETE /users', () => {
        it('should delete user', (done) => {
            const req = request(app).delete('/users');
            req.cookies = cookies;
            req
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.nickName).to.equal(user.nickName);
                    done();
                })
                .catch(done);
        });
    });
});
