"use strict";
const debug = require('debug')('transomjs:nonce');
const expect = require('chai').expect;
const sinon = require('sinon');
const NonceHandler = require('../lib/nonceHandler');
const mongoose = require('mongoose');
const PocketRegistry = require('pocket-registry');
const mongotest = require('./mongotest');
const TransomNonce = require('../index');


describe('NonceHandler', function (done) {

    const server = {};

    before(function () {
        server.registry = new PocketRegistry();
        mongoose.Promise = Promise;
        server.registry.set('mongoose', mongoose);

        const options = {};
        TransomNonce.initialize(server, options);
    });

    beforeEach(mongotest.prepareDb('mongodb://localhost/transomnoncetests', {
        timeout: 10000
    }));
    afterEach(mongotest.disconnect());

    it('has been registered with the server', function () {
        const nonceHandler = server.registry.get('transomNonce');
        expect(nonceHandler).to.be.an.instanceOf(Object);
        expect(nonceHandler.createNonce).to.be.an.instanceOf(Function);
        expect(nonceHandler.verifyNonce).to.be.an.instanceOf(Function);
    });

    it('can create aand verify a Nonce', function () {
        const nonceHandler = server.registry.get('transomNonce');

        const payload = {
            foo: 123
        };
        const expirySeconds = 1;
        nonceHandler.createNonce(payload, expirySeconds, function (err, nonce) {
            expect(err).to.be.null;
            nonceHandler.verifyNonce(nonce.token, function (err, verifiedPayload) {
                expect(err).to.be.null;
                expect(verifiedPayload).to.eql(payload);
            })
        });
    });

    it('can create an expired nonce, which triggers an error on Validate', function () {
        const nonceHandler = server.registry.get('transomNonce');

        const payload = {
            foo: 123
        };
        const expiredSeconds = -1;
        nonceHandler.createNonce(payload, expiredSeconds, function (err, nonce) {
            expect(err).to.be.null;
            nonceHandler.verifyNonce(nonce.token, function (err, verifiedPayload) {
                expect(err).to.be.not.null; // Invalid Token
                expect(verifiedPayload).to.be.undefined;
            })
        });
    });

    it('triggers an error when called with a garbage token', function () {
        const nonceHandler = server.registry.get('transomNonce');

        nonceHandler.verifyNonce('I am an invalid token!', function (err, verifiedPayload) {
            expect(err).to.be.not.null; // Invalid Token
            expect(err.message).to.equal('Invalid Token');
            expect(verifiedPayload).to.be.undefined;
        })
    });

});