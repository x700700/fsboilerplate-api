const mongoose = require('mongoose');
const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const chai = require('chai'); // eslint-disable-line import/newline-after-import
const { expect } = chai;
const app = require('../../index');

chai.config.includeStack = true;

after((done) => {
    // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
    mongoose.models = {};
    mongoose.modelSchemas = {};
    mongoose.connection.close();
    done();
});


describe('## Misc', () => {
    describe('# GET /status', () => {
        it('should return OK', (done) => {
            request(app)
                .get('/status')
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.text).to.equal('OK');
                    done();
                })
                .catch(done);
        });
    });

    describe('# GET /404', () => {
        it('should return 404 status', (done) => {
            request(app)
                .get('/404')
                .expect(httpStatus.NOT_FOUND)
                .then(() => {
                    // expect(res.body.message).to.equal('Not Found'); // private
                    done();
                })
                .catch(done);
        });
    });

});
