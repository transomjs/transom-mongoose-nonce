"use strict";
const debug = require('debug')('transomjs:nonce');
const expect = require('chai').expect;
const sinon = require('sinon');
const NonceHandler = require('../lib/nonceHandler');
const mongoose = require('mongoose');
const PocketRegistry = require('pocket-registry');
const mongotest = require('./mongotest');


describe('NonceHandler', function (done) {

    beforeEach(mongotest.prepareDb('mongodb://localhost/transomnoncetests', {
        timeout: 10000
    }));
    afterEach(mongotest.disconnect());

    // beforeEach(function (done) {

    //     // Stub out a mock nodemailer
    //     // sinon.stub(nodemailer, 'createTransport').callsFake(function (opts) {
    //     //     // whatever you would like innerLib.toCrazyCrap to do under test
    //     //     function Transport() {
    //     //         this.sendMail = function (opts, cb) {
    //     //             if (cb) {
    //     //                 return cb(opts.error, opts.response);
    //     //             }
    //     //         };
    //     //         this.close = sinon.spy();
    //     //     };
    //     //     return new Transport();
    //     // });
    //     debug('Before each', this);
    //     mongotest.prepareDb.call(this, 'mongodb://localhost/transomnoncetests')(done);
    // });

    // afterEach(function (done) {
    //     // restore original functionality
    //     // nodemailer.createTransport.restore();
    //     debug('After each');
    //     mongotest.disconnect(done);
    // });

    it('can call createTransport', function () {
        const server = {};
        server.registry = new PocketRegistry();
        const dummyOptions = {};
        // const transomNonce = new NonceHandler(server, dummyOptions);
        debug(' ** each');

        expect(true, "I should write some tests!");

        // transomSmtp.sendMail({
        //     from: "noreply@transomjs",
        //     html: "Hello"
        // });
        // sinon.assert.calledOnce(nodemailer.createTransport);
    });
});