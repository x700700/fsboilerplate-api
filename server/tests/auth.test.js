const mongoose = require('mongoose');
const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const chai = require('chai'); // eslint-disable-line import/newline-after-import
const { expect } = chai;
const app = require('../../index');
const utils = require('./utils');
// const config = require('../../config/config');


chai.config.includeStack = true;

after((done) => {
    // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
    mongoose.models = {};
    mongoose.modelSchemas = {};
    mongoose.connection.close();
    done();
});


describe('## Auth APIs', () => {
    const itemsId = Math.random().toString(36).substring(7);
    const password = 'Asdf12';
    const newPass = 'Uri321';
    let user = {
        nickName: `!!__test-${itemsId}`,
        password: password,
        firstName: `test-${itemsId}`,
        lastName: 'Weisstest',
    };
    const loginReq = {
        nickName: user.nickName,
        password: user.password,
    };
    const changePassReq = {
        nickName: 'dummy@dummy.com',
        oldPassword: 'password',
        newPassword: newPass,
    };
    let cookies;

    describe('# GET /trainings', () => {
        it('should failed get trainings due to not signed in', (done) => {
            const req = request(app).get('/trainings');
            req.cookies = cookies;
            req
                .send(user)
                .expect(httpStatus.UNAUTHORIZED)
                .then(() => {
                    done();
                })
                .catch(done);
        });
    });

    describe('# POST /auth/register & login', () => {
        it('should return Authentication error', (done) => {
            request(app)
                .post('/auth/login')
                .send(loginReq)
                .expect(httpStatus.UNAUTHORIZED)
                .then((res) => {
                    expect(res.error.text).to.include('Bad credentials');
                    done();
                })
                .catch(done);
        });

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

        it('should failed auth check', (done) => {
            const req = request(app).get('/auth/check');
            req.cookies = cookies;
            req
                .send(user)
                .expect(httpStatus.UNAUTHORIZED)
                .then(() => {
                    done();
                })
                .catch(done);
        });

        it('should login & get valid session cookie', (done) => {
            request(app)
                .post('/auth/login')
                .send(loginReq)
                .expect(httpStatus.OK)
                .expect('set-cookie', /connect.sid/)
                .then((res) => {
                    cookies = utils.extractCookies(res);
                    done();
                })
                .catch(done);
        });

        it('should succeed auth check', (done) => {
            const req = request(app).get('/auth/check');
            req.cookies = cookies;
            req
                .send(user)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.nickName).to.equal(user.nickName);
                    done();
                })
                .catch(done);
        });

    });

    describe('# POST /auth/change-password', () => {
        it('should failed due to bad nickName', (done) => {
            const req = request(app).post('/auth/change-password');
            req.cookies = cookies;
            req
                .send(changePassReq)
                .expect(httpStatus.UNAUTHORIZED)
                .then(() => {
                    done();
                })
                .catch(done);
        });

        it('should failed due to bad password', (done) => {
            changePassReq.nickName = user.nickName;
            const req = request(app).post('/auth/change-password');
            req.cookies = cookies;
            req
                .send(changePassReq)
                .expect(httpStatus.UNAUTHORIZED)
                .then(() => {
                    done();
                })
                .catch(done);
        });

        it('should succeed', (done) => {
            changePassReq.nickName = user.nickName;
            changePassReq.oldPassword = password;
            const req = request(app).post('/auth/change-password');
            req.cookies = cookies;
            req
                .send(changePassReq)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.nickName).to.equal(user.nickName);
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
