'use strict';

const crypto = require('crypto');
const debug = require('debug')('transom:nonce');

module.exports = function NonceHandler(server, options) {
    const mongoose = server.registry.get('mongoose');
    const NonceModel = mongoose.model('TransomNonce');

    options = options || {};
    const softDelete = options.softDelete || false; // Default false
    const modifiedBy = options.modifiedBy || 'transom-nonce';

    function createNonce(payload, expirySeconds, callback) {
        const token = crypto.randomBytes(64).toString('hex');
        const expiry = new Date();
        expiry.setSeconds(expiry.getSeconds() + expirySeconds);

        const newNonce = {
            token,
            expiry,
            payload,
            modifiedBy
        }
        debug('Creating a new Nonce');
        NonceModel.create(newNonce, callback);
    }

    function verifyNonce(token, callback) {
        const qry = {
            token,
            consumed: false,
            expiry: {
                $gte: Date.now()
            }
        }
        NonceModel.findOne(qry, function (err, nonce) {
            if (err) {
                debug('Error looking for Nonce', err);
                return callback(err);
            }
            if (!nonce) {
                debug('Nonce not found; Invalid Token');
                return callback(new Error('Invalid Token'));
            }

            if (softDelete) {
                // Mark this one as consumed.
                nonce.consumed = true;
                nonce.modifiedBy = modifiedBy;
                nonce.save(function (err, result) {
                    if (err) {
                        debug('Error consuming Nonce (soft delete)', err);
                        return callback(err);
                    }
                    debug('Consumed a Nonce (soft delete)');
                    callback(null, result.payload);
                });
            } else {
                // Delete it from the database.
                nonce.remove(function (err, result) {
                    if (err) {
                        debug('Error consuming Nonce', err);
                        return callback(err);
                    }
                    debug('Consumed a Nonce');
                    callback(null, result.payload);
                });
            }
        });
    }

    return {
        createNonce,
        verifyNonce
    };
};