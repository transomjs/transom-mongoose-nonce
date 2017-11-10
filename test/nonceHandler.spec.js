"use strict";
const expect = require('chai').expect;
const sinon = require('sinon');
const NonceHandler = require('../lib/nonceHandler');
const mongoose = require('mongoose');
const PocketRegistry = require('pocket-registry');


describe('NonceHandler', function () {

    beforeEach(function () {
        // Stub out a mock nodemailer
        // sinon.stub(nodemailer, 'createTransport').callsFake(function (opts) {
        //     // whatever you would like innerLib.toCrazyCrap to do under test
        //     function Transport() {
        //         this.sendMail = function (opts, cb) {
        //             if (cb) {
        //                 return cb(opts.error, opts.response);
        //             }
        //         };
        //         this.close = sinon.spy();
        //     };
        //     return new Transport();
        // });
    });

    afterEach(function () {
        // restore original functionality
        // nodemailer.createTransport.restore();
    });
    
    it('can call createTransport', function () {
        const server = {};
		server.registry = new PocketRegistry();
        const dummyOptions = {};
       // const transomNonce = new NonceHandler(server, dummyOptions);

       expect(true, "I should write some tests!");

        // transomSmtp.sendMail({
        //     from: "noreply@transomjs",
        //     html: "Hello"
        // });
        // sinon.assert.calledOnce(nodemailer.createTransport);
    });
});