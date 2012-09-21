var events = require('events');
var Proto = require('uberproto');
var winston = require('winston');
var connect = require('connect');

var TestServer = Proto.extend({
	init : function(config) {
		this.emitters = {};
		this.config = config;
		this.connect = config.connect || connect();

		this.on('listening', function(server, port) {
			winston.debug('Listening on port ' + port);
		});

		this.on('registering', function(token, emitter) {
			winston.debug('Registering token', { token : token });
		});
	},

	use : function() {
		this.connect.use.apply(this.connect, arguments);
		return this;
	},

	handle : function(callback) {
		callback(this);
		return this;
	},

	isValid : function(token) {
		return this.emitters[token] !== undefined;
	},

	listen : function(port) {
		var server = this.connect.listen(port);
		this.emit('listening', server, port);
		this.on('close', function() {
			server.close();
		});
		return server;
	},

	close : function() {
		this.emit('close');
	},

	register : function(token, emitter) {
		var self = this;
		this.emit('registering', token, emitter);
		this.emitters[token] = emitter;
		emitter.on('testing', function(testReporter) {
			// Once the test reporter fires the exitEvent
			// remove this emitter from the list so that it can't authenticate again
			testReporter.once(self.config.exitEvent, function() {
				winston.debug('Removing token ' + token);
				delete self.emitters[token];
			});
		});
		return this;
	},

	emitter : function(token) {
		return this.emitters[token];
	}
});

TestServer.mixin(events.EventEmitter.prototype);

module.exports = TestServer;
