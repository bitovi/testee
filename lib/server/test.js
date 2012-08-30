var socketio = require('socket.io'),
	url = require('url'),
	events = require('events'),
	Proto = require('uberproto'),
	winston = require('winston');

var pipeEvents = ['QUnit.begin', 'QUnit.log', 'QUnit.testStart', 'QUnit.moduleStart', 'QUnit.done'];

var TestServer = Proto.extend({
	init : function(connect) {
		this._emitters = {};
		this._connet = connect;
	},

	listen : function(server) {
		var io = socketio.listen(server);
		var self = this;

		io.configure(function(){
			// Socket.io configuration
			io.enable('browser client etag');
			io.set('log level', 1);

			io.set('transports', [
				'xhr-polling', 'websocket', 'flashsocket',
				'htmlfile', 'jsonp-polling'
			]);

			io.set('authorization', function (handshakeData, callback) {
				// Try and get a registered emitter from the referer URL token
				var parsed = url.parse(handshakeData.headers.referer || '', true);
				var emitter = self.emitter(parsed.query.__token);
				if(emitter) {
					// Store the emitter in the global handshakeData
					handshakeData.emitter = emitter;
					handshakeData.__token = parsed.query.__token;
					callback(null, true);
				} else {
					// TODO better error message
					callback('No registered emitter found');
				}
			});
		});

		io.sockets.on('connection', function(socket) {
			// Pipe events to the registered event emitter
			winston.debug('Got valid connection, starting to pipe events', { token : socket.handshake.__token });
			pipeEvents.forEach(function(event) {
				socket.on(event, function() {
					var args = Array.prototype.slice.call(arguments);
					args.unshift(event);
					socket.handshake.emitter.emit.apply(socket.handshake.emitter, args);
				})
			});
		});
	},

	register : function(token, emitter) {
		winston.debug('TestServer is registering token', { token : token });
		this._emitters[token] = emitter;
	},

	emitter : function(token) {
		return this._emitters[token];
	}
});

module.exports = function(connect) {
	return TestServer.create(connect);
}

module.exports.TestServer = TestServer;
