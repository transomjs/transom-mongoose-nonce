'use strict';

const { Schema } = require('mongoose');
const transomNonceSchema = require('./transomNonceSchema');
const auditablePlugin = require('@transonjs/transom-mongoose/plugins/auditablePlugin');
const NonceHandler = require('./lib/nonceHandler');

function TransomNonce() {
    this.initialize = function (server, options) {
        const mongoose = server.registry.get('mongoose');
		mongoose.model('TransomAclUser', transomNonceSchema.NonceSchema());

        const nonceHandler = new NonceHandler(server, options);
        server.registry.set('nonce', nonceHandler);
    }
}

module.exports = new TransomNonce();