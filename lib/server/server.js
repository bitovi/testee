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
		this.emit('registering', token, emitter);
		var emitters = this.emitters;
		emitters[token] = emitter;
		// Once the test is done, remove it from the list
		// so that it can't authenticate again
		emitter.once(this.config.exitEvent, function() {
			winston.debug('Removing token ' + token);
			delete emitters[token];
		});
		return this;
	},

	pipeEvents : function(source, target) {
		if(typeof target == 'string') {
			target = this.emitters[target];
		}

		if(!target) {
			throw new Error('No target event emitter to pipe (' + token + ')');
		}

		this.config.events.forEach(function(event) {
			source.on(event, function() {
				var args = Array.prototype.slice.call(arguments);
				args.unshift(event);
				target.emit.apply(target, args);
			});
		});
	}
});

TestServer.mixin(events.EventEmitter.prototype);

module.exports = TestServer;
