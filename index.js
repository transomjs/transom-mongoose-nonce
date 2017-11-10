'use strict';

const { Schema } = require('mongoose');
const transomNonceSchema = require('./lib/nonceSchema');
const auditablePlugin = require('@transomjs/transom-mongoose/lib/plugins/auditablePlugin');
const NonceHandler = require('./lib/nonceHandler');

function TransomNonce() {
    this.initialize = function (server, options) {
        const mongoose = server.registry.get('mongoose');
		mongoose.model('TransomNonce', transomNonceSchema.NonceSchema());

        const nonceHandler = new NonceHandler(server, options);
        server.registry.set('transomNonce', nonceHandler);
    }
}

module.exports = new TransomNonce();