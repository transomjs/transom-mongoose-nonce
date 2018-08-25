'use strict';

const crypto = require('crypto');
const debug = require('debug')('transom:nonce');

module.exports = function NonceHandler(server, options) {
    const mongoose = server.registry.get('mongoose');
    const NonceModel = mongoose.model('TransomNonce');

    options = options || {};
    const softDelete = options.softDelete || false; // Default false
    const modifiedBy = options.modifiedBy || 'transom-nonce';

    function loggableToken(token) {
        return `${token.substr(0, 4)}***${token.substr(-4)}`;
    }

    function createNonce(payload, expirySeconds, callback) {
        const token = crypto.randomBytes(64).toString('hex');
        const logToken = loggableToken(token);
        const expiry = new Date();
        expiry.setSeconds(expiry.getSeconds() + expirySeconds);

        const newNonce = {
            token,
            expiry,
            payload,
            modifiedBy
        }
        NonceModel.create(newNonce, (err, nonce) => {
            if (err) {
                debug(`Error creating Nonce ${logToken}`, err);
                return callback(err);
            }
            debug(`Nonce created ${logToken}, expires in ${expirySeconds} seconds.`);
            callback(err, nonce);
        });
    }

    function verifyNonce(token, callback) {
        const logToken = loggableToken(token);
        const qry = {
            token,
            consumed: false,
            expiry: {
                $gte: Date.now()
            }
        }
        NonceModel.findOne(qry, function (err, nonce) {
            if (err) {
                debug(`Error looking for Nonce ${logToken}`, err);
                return callback(err);
            }
            if (!nonce) {
                debug(`Nonce not found; Invalid Token ${logToken}`);
                return callback(new Error('Invalid Token'));
            }

            if (softDelete) {
                // Mark this one as consumed.
                nonce.consumed = true;
                nonce.modifiedBy = modifiedBy;
                nonce.save(function (err, result) {
                    if (err) {
                        debug(`Error consuming Nonce ${logToken} (soft)`, err);
                        return callback(err);
                    }
                    debug(`Consumed a Nonce ${logToken} (soft)`);
                    callback(null, result.payload);
                });
            } else {
                // Delete it from the database.
                nonce.remove(function (err, result) {
                    if (err) {
                        debug(`Error consuming Nonce ${logToken}`, err);
                        return callback(err);
                    }
                    debug(`Consumed a Nonce ${logToken}`);
                    callback(null, result.payload);
                });
            }
        });
    }

    return {
        loggableToken,
        createNonce,
        verifyNonce
    };
};