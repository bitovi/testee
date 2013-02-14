"use strict";

var connect = require('connect');
var _ = require('underscore');
var EventEmitter = require('events').EventEmitter;
var Converter = require('../converter');
var logger = require('../utils').getLogger();
var mocha = require('mocha');
var istanbul = require('istanbul');

/**
 * The server class
 *
 * @param config {Object} The initial server configuration.
 * @constructor
 */
var TestServer = function (config) {
	_.extend(this, {
		instances: {},
		config: config,
		connect: config.connect || connect(),
		converter: new Converter()
	});

	this.reporter = new mocha.reporters[config.reporter](this.converter);
	this.on('listening', function (server, port) {
		logger.debug('Listening on port', port);
	});

	this.on('registering', function (token) {
		logger.debug('Registering token', { token: token });
	});
};

TestServer.prototype = new EventEmitter();

_.extend(TestServer.prototype, {
	/**
	 * Use a Middleware on this server
	 * @return {Server} The server instance
	 */
	use: function () {
		this.connect.use.apply(this.connect, arguments);
		return this;
	},
	/**
	 * Add a handler function. A handler will be called right
	 * away with the server instance as the single parameter.
	 *
	 * @param {Function} callback The handler function taking
	 * the server instance as the single parameter.
	 * @return {Server}
	 */
	handle: function (callback) {
		callback(this);
		return this;
	},
	/**
	 * Checks if a given token has a registered instance.
	 *
	 * @param {String} token The token to check for
	 * @return {Boolean} Whether there is an instance or now.
	 */
	isValid: function (token) {
		return this.instances[token] !== undefined;
	},
	/**
	 * Start the server on a given port.
	 *
	 * @param port {Integer} The port to listen on
	 * @return {*}
	 */
	listen: function (port) {
		var self = this;
		var server = this.connect.listen(port);
		server.on('listening', function () {
			self.emit('listening', server, port);
		});
		this.on('close', function () {
			server.close();
		});
		return server;
	},
	close: function () {
		this.emit('close');
	},
	/**
	 * Register a new instance for a given token. An instance is
	 * an event emitter expected to emit the `testing` event with
	 * the remote reporter (EventEmitter) when a test is started.
	 *
	 * @param token
	 * @param instance
	 * @return {*}
	 */
	register: function (token, instance) {
		var self = this;
		this.emit('registering', token, instance);
		this.instances[token] = instance;

		instance.on('testing', function (testReporter) {
			self.converter.run(testReporter);

			// Once the test reporter officially starts
			// remove this emitter from the list so that it can't authenticate again
			testReporter.once(self.config.startEvent, function () {
				logger.debug('Removing token ' + token);
				delete self.instances[token];
			});

			// Coverage reports
			testReporter.on('coverage', function (coverageObject) {
				// TODO html-cov etc.
				var report = istanbul.Report.create('text'),
					collector = new istanbul.Collector;

				collector.add(coverageObject);
				report.writeReport(collector);
			});
		});

		return this;
	},
	emitter: function (token) {
		return this.instances[token];
	}
});

module.exports = TestServer;
