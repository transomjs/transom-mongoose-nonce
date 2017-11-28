# transom-mongoose-nonce
Create and consume one-time-use, short lifetime tokens with a payload within Transom.

[![Build Status](https://travis-ci.org/transomjs/transom-mongoose-nonce.svg?branch=master)](https://travis-ci.org/transomjs/transom-mongoose-nonce)

## Installation

```bash
$ npm install --save @transomjs/transom-mongoose-nonce
```

## Usage
Created specifically for SocketIO handshaking but useful for many things, the transom-mongoose-nonce module uses mongoose to provide the ability to create and consume nonces. On initialization, a nonce handler is created and added to the Transom server registry. It has only two methods, `createNonce` and `verifyNonce`.

### createNonce
`createNonce` takes three arguments, as follows:
* `payload` can be any JavaScript object. It will get stored until the Nonce is consumed.
* `expirySeconds` a period after which the nonce is no longer valid and cannot be consumed.
* `callback` is called after the nonce is created. Arguments are (err, nonce).

### verifyNonce
`verifyNonce` takes two arguments, as follows:
* `token` this is a 64 byte unique key
* `callback` is called with the result of the nonce lookup. Arguments are (err, payload).

#### Example: createNonce
This is an example endpoint to create a nonce for the SocketIO handshake, switching from an AJAX request to a socket connection.
```javascript
	function handleSocketToken(req, res, next) {
		var p = new Promise(function (resolve, reject) {
			// Create the nonce with the current User object as it's payload.
			const expirySeconds = 5;

			// The NonceHandler is stored in the server Registry.
			const transomNonce = server.registry.get('transomNonce');

			transomNonce.createNonce(req.locals.user, expirySeconds, function (err, nonce) {
				if (err) {
					return reject(err);
				}
				resolve(nonce);
			});
		}).then(function (nonce) {
			res.json({
				token: nonce.token
			});
			next();
		}).catch(function (err) {
			next(err);
		});
	}; 
```

#### Example: verifyNonce
This example middleware used on the SocketIO side, telling the socket connection which user it is for.
```javascript
    this.nonceAuthMiddleware = function (socket, next) {

        // The NonceHandler is stored in the server Registry.
        const nonce = args.server.registry.get('transomNonce');

        nonce.verifyNonce(socket.handshake.query.token, function (err, payload) {
            if (err) {
                setTimeout(function () {
                    // Socket Authentication failed. Disconnecting.
                    socket.disconnect(true);
                }, 20);
                return next(new Error(INVALID_TOKEN));
            }
            // Store the User object on each verified socket connection,
            // we can use this later to emit data to specific users.
            socket.transomUser = payload;
            return next();
        })
    }
```
