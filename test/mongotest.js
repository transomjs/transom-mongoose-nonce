var assert = require('assert');
var mongoose = require('mongoose');
var debug = require('debug')('transom:nonce');

module.exports = {
    prepareDb: function (connectionString, options) {
        // support use of non localhost MongoDB using env variable MONGO_SERVER
        if (process.env.MONGO_SERVER) {
            connectionString = connectionString.replace('mongodb://localhost', 'mongodb://' + process.env.MONGO_SERVER);
            debug('Using mongodb server from environment variable %s', connectionString);
        }

        options = options || {};
        options.timeout = options.timeout || 5000;

        return function (cb) {
            this.timeout(options.timeout);

            mongoose.connect(connectionString, {useMongoClient: true}, function (err) {
                assert.ifError(err);

                mongoose.connection.db.collections(function (err, collections) {
                    assert.ifError(err);

                    var collectionsToDrop = collections
                        .filter(function (col) {
                            return col.collectionName.indexOf('system.') != 0;
                        })
                        .map(function (col) {
                            return col.collectionName;
                        });

                    debug('Dropping non system collections...');
                    dropCollections(collectionsToDrop, 0, cb);
                });
            });
        };
    },

    disconnect: function () {
        return function (cb) {
            mongoose.disconnect(cb);
        }
    }
};

function dropCollections(collections, index, cb) {
    if (typeof (index) == 'function') {
        cb = index;
        index = 0;
    }

    if (index < collections.length) {
        dropCollection(collections[index], function (err) {
            assert.ifError(err);

            dropCollections(collections, index + 1, cb);
        });
    } else {
        debug('Dropped all non system collections!');
        cb();
    }
}

function dropCollection(collection, cb) {
    mongoose.connection.db.dropCollection(collection, function (err) {
        if (err) {
            debug('Could not drop collection. Retrying...');

            // Simple manual retry
            return mongoose.connection.db.dropCollection(collection, cb);
        }

        cb();
    });
}