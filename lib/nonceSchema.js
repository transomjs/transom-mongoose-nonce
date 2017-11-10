'use strict';
const { Schema } = require('mongoose');
const auditablePlugin = require('@transomjs/transom-mongoose/lib/plugins/auditablePlugin');

module.exports = function() {

	function NonceSchema() {
        const transomNonceSchema = new Schema({
            token: String,
            expiry: Date,
            consumed: {
                type: Boolean,
                default: false
            },
            payload: Schema.Types.Mixed
        }, {
            collection: 'nonces'
        });
        transomNonceSchema.plugin(auditablePlugin);

		return transomNonceSchema;
	}

	return {
		NonceSchema
	}
}();
