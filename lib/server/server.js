"use strict";

var connect = require('connect');
var _ = require('underscore');
var EventEmitter = require('events').EventEmitter;
var logger = require('../utils').getLogger();

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
};

TestServer.prototype = new EventEmitter();

_.extend(TestServer.prototyp, {
	use : function () {
		this.connect.use.apply(this.connect, arguments);
		return this;
	},
	handle : function (callback) {
		callback(this);
		return this;
	},
	isValid : function (token) {
		return this.emitters[token] !== undefined;
	},
	listen : function (port) {
		var server = this.connect.listen(port);
		this.emit('listening', server, port);
		this.on('close', function () {
			server.close();
		});
		return server;
	},
	close : function () {
		this.emit('close');
	},
	register : function (token, emitter) {
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
	},
	emitter : function (token) {
		return this.emitters[token];
	}
});

module.exports = TestServer;
