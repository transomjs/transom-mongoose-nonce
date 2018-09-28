"use strict";
const expect = require('chai').expect;
const mongoose = require('mongoose');
const PocketRegistry = require('pocket-registry');
const mongotest = require('./mongotest');
const TransomNonce = require('../index');


describe('NonceHandler', function () {
    const server = {};

    before(function (done) {
        const prep = mongotest.prepareDb('mongodb://localhost/noncetests', {
            timeout: 10000
        });
        prep(() => {
            server.registry = new PocketRegistry();
            mongoose.Promise = Promise;
            server.registry.set('mongoose', mongoose);
    
            const options = {};
            TransomNonce.initialize(server, options);
            done();
        });
    });

    after(function(done) {
        mongotest.disconnect(() => {
            done();
        });
    });

    it('has been registered with the server', function () {
        const nonceHandler = server.registry.get('transomNonce');
        expect(nonceHandler).to.be.an.instanceOf(Object);
        expect(nonceHandler.loggableToken).to.be.an.instanceOf(Function);
        expect(nonceHandler.createNonce).to.be.an.instanceOf(Function);
        expect(nonceHandler.verifyNonce).to.be.an.instanceOf(Function);
    });

    it('can obfuscate a Nonce', function () {
        const nonceHandler = server.registry.get('transomNonce');
        const dummyNonce = "0123456789ABCDEF";
        expect(nonceHandler.loggableToken(dummyNonce)).to.equal("0123***CDEF");
    });

    it('can obfuscate an empty string', function () {
        const nonceHandler = server.registry.get('transomNonce');
        const dummyNonce = '';
        expect(nonceHandler.loggableToken(dummyNonce)).to.equal("***");
    });

    it('can create and verify a Nonce', function (done) {
        const nonceHandler = server.registry.get('transomNonce');
        const payload = {
            foo: 123
        };
        const expirySeconds = 10;
        try {
            nonceHandler.createNonce(payload, expirySeconds, function (err, nonce) {
                expect(err).to.be.null;
                nonceHandler.verifyNonce(nonce.token, function (err, verifiedPayload) {
                    expect(err).to.be.null;
                    expect(verifiedPayload).to.eql(payload);
                    done();
                })
            });
        } catch (error) {
            console.error({error});
            done();
        }
    });

    it('can create an expired nonce, which triggers an error on Validate', function (done) {
        const nonceHandler = server.registry.get('transomNonce');
        const payload = {
            foo: 123
        };
        const expiredSeconds = -1;
        try {
            nonceHandler.createNonce(payload, expiredSeconds, function (err, nonce) {
                expect(err).to.be.null;
                nonceHandler.verifyNonce(nonce.token, function (err, verifiedPayload) {
                    expect(err).to.be.not.null; // Invalid Token
                    expect(verifiedPayload).to.be.undefined;
                    done();
                });
            });
        } catch (error) {
            console.error({error});
            done();
        }
    });

    it('triggers an error when called with a garbage token', function (done) {
        const nonceHandler = server.registry.get('transomNonce');
        try {
            nonceHandler.verifyNonce('I am an invalid token!', function (err, verifiedPayload) {
                expect(err).to.be.not.null; // Invalid Token
                expect(err.message).to.equal('Invalid Token');
                expect(verifiedPayload).to.be.undefined;
                done();
            });
        } catch (error) {
            console.error({error});
            done();
        }
    });
});