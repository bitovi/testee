"use strict";

var connect = require('connect');
var _ = require('underscore');
var EventEmitter = require('events').EventEmitter;
var Converter = require('../converter');
var logger = require('../utils').getLogger();
var mocha = require('mocha');

var TestServer = function (config) {
	_.extend(this, {
		instances: {},
		config: config,
		connect: config.connect || connect(),
		converter: new Converter(),
		reporter: new mocha.reporters[config.reporter](this)
	});

	this.on('listening', function (server, port) {
		logger.debug('Listening on port', port);
	});

	this.on('registering', function (token) {
		logger.debug('Registering token', { token: token });
	});
};

TestServer.prototype = new EventEmitter();

_.extend(TestServer.prototype, {
	use: function () {
		this.connect.use.apply(this.connect, arguments);
		return this;
	},
	handle: function (callback) {
		callback(this);
		return this;
	},
	isValid: function (token) {
		return this.instances[token] !== undefined;
	},
	listen: function (port) {
		var server = this.connect.listen(port);
		this.emit('listening', server, port);
		this.on('close', function () {
			server.close();
		});
		return server;
	},
	close: function () {
		this.emit('close');
	},
	register: function (token, instance) {
		var self = this;
		this.emit('registering', token, instance);
		this.instances[token] = instance;
		instance.on('testing', function (testReporter) {
			// Once the test reporter fires the exitEvent
			// remove this emitter from the list so that it can't authenticate again
			testReporter.once(self.config.exitEvent, function () {
				logger.debug('Removing token ' + token);
				delete self.instances[token];
			});
		});
		return this;
	},
	emitter: function (token) {
		return this.instances[token];
	}
});

module.exports = TestServer;
