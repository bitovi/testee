var logger = require('../utils').getLogger('Server');
var connect = require('connect');
var EventEmitter = require('events').EventEmitter;

var TestServer = function (config) {
	this.emitters = {};
	this.config = config;
	this.connect = config.connect || connect();

	this.on('listening', function (server, port) {
		logger.debug('Listening on port', port);
	});

	this.on('registering', function (token, emitter) {
		logger.debug('Registering token', { token : token });
	});
}

TestServer.prototype = new EventEmitter();

TestServer.prototype.use = function () {
	this.connect.use.apply(this.connect, arguments);
	return this;
}

TestServer.prototype.handle = function (callback) {
	callback(this);
	return this;
}

TestServer.prototype.isValid = function (token) {
	return this.emitters[token] !== undefined;
}

TestServer.prototype.listen = function (port) {
	var server = this.connect.listen(port);
	this.emit('listening', server, port);
	this.on('close', function () {
		server.close();
	});
	return server;
}

TestServer.prototype.close = function () {
	this.emit('close');
}

TestServer.prototype.register = function (token, emitter) {
	var self = this;
	this.emit('registering', token, emitter);
	this.emitters[token] = emitter;
	emitter.on('testing', function (testReporter) {
		// Once the test reporter fires the exitEvent
		// remove this emitter from the list so that it can't authenticate again
		testReporter.once(self.config.exitEvent, function () {
			logger.debug('Removing token ' + token);
			delete self.emitters[token];
		});
	});
	return this;
}

TestServer.prototype.emitter = function (token) {
	return this.emitters[token];
}

module.exports = TestServer;
