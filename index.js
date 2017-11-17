'use strict';

const { Schema } = require('mongoose');
const transomNonceSchema = require('./lib/nonceSchema');
const auditablePlugin = require('@transomjs/transom-mongoose/lib/plugins/auditablePlugin');
const NonceHandler = require('./lib/nonceHandler');

function TransomNonce() {
    this.initialize = function (server, options) {
        const mongoose = server.registry.get(options.mongooseKey || 'mongoose');
		mongoose.model('TransomNonce', transomNonceSchema.NonceSchema());

        server.registry.set(options.registryKey || 'transomNonce', new NonceHandler(server, options));
    }
}

module.exports = new TransomNonce();