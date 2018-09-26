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


describe('## User APIs', () => {
    const itemsId = Math.random().toString(36).substring(7);
    const password = 'Asdf12';
    let user = {
        nickName: `!!__test-${itemsId}`,
        password: password,
        firstName: `test-${itemsId}`,
        lastName: 'Weisstest',
    };
    let cookies;

    describe('# PUT /users', () => {
        it('should failed update user due to not signed in', (done) => {
            const req = request(app).put('/users');
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
                    done();
                })
                .catch(done);
        });
    });

    describe('# PUT /users', () => {
        it('should update user details', (done) => {
            const userUpdate = {
                firstName: 'user renamed',
            };
            const req = request(app).put('/users');
            req.cookies = cookies;
            req
                .send(userUpdate)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.id).to.equal(user.id);
                    expect(res.body.nickName).to.equal(user.nickName);
                    expect(res.body.firstName).to.include('renamed');
                    user = res.body;
                    done();
                })
                .catch(done);
        });

        it('should get the updated user', (done) => {
            const req = request(app).get('/auth/check');
            req.cookies = cookies;
            req
                .send(user)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.id).to.equal(user.id);
                    expect(res.body.nickName).to.equal(user.nickName);
                    expect(res.body.firstName).to.include('renamed');
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
