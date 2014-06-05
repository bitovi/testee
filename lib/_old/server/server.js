'use strict';

var connect = require('connect');
var _ = require('underscore');
var EventEmitter = require('events').EventEmitter;
var Converter = require('../converter/index');
var logger = require('../utils').getLogger();
var mocha = require('mocha');
var util = require('util');

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
		converter: new Converter(),
		hooks: {},
		errorId: 0
	});

	if(mocha.reporters[config.reporter]) {
		this.reporter = new mocha.reporters[config.reporter](this.converter);
	} else {
		// Just in case we got a nonexistent converter, fallback to Spec to report the error
		this.reporter = new mocha.reporters.Spec(this.converter);
		this.error(new Error('Can not find reporter ' + config.reporter + ' falling back to Spec.'), 'Reporter');
	}

	this.on('listening', function (server, port) {
		logger.debug('Listening on port', port);
	});

	this.on('registering', function (token) {
		logger.debug('Registering token', { token: token });
	});
};

util.inherits(TestServer, EventEmitter);

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
	hook: function (event, handler) {
		if (!this.hooks[event]) {
			this.hooks[event] = [];
		}
		this.hooks[event].push(handler);
		this.emit('hook', event, this.hooks[event]);
		return this.hooks[event];
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
		var timeout = setTimeout(function() {
			self.error(new Error('No test started within the timeout of ' + self.config.timeout + ' seconds.'),
				'Server', false);
		}, self.config.timeout * 1000);

		self.emit('registering', token, instance);
		self.instances[token] = instance;


		instance.on('testing', function (testReporter) {
			self.converter.run(testReporter);
			self.emit('testing', testReporter, self);

			// Once the test reporter officially starts
			// remove this emitter from the list so that it can't authenticate again
			testReporter.once(self.config.startEvent, function () {
				logger.debug('Removing token ' + token);
				delete self.instances[token];
				clearTimeout(timeout);
			});

			testReporter.once(self.config.exitEvent, function () {
				self.emit('done', instance, testReporter, self);
			});

			// Add hooks
			_.each(self.hooks, function (handlers, event) {
				_.each(handlers, function (handler) {
					testReporter.on(event, function () {
						var args = _.toArray(arguments);
						args.unshift(self);
						handler.apply(this, args);
					});
				});
			});
		});

		return this;
	},
	/**
	 * Report an error on this server.
	 *
	 * @param {Error} error The error that happened
	 * @param {String} [context] A description of the context the error happened in
	 * @param {Boolean} [critical] If this is a critial error
	 */
	error: function(error, context, critical) {
		var self = this.converter;
		var events = self.config.events;
		var reporter = new EventEmitter();
		var suiteId = --self.errorId;
		var testId = --self.errorId;

    console.dir(error);

		this.converter.run(reporter);

		reporter.emit(events.suite, {
			id: suiteId,
			title: 'Testee Error',
			root: true
		});

		reporter.emit(events.test, {
			id: testId,
			title: context || 'General Error'
		});

		reporter.emit(events.fail, {
			id: testId,
			err: error
		});

		reporter.emit(events.testEnd, {
			id: testId
		});

		reporter.emit(events.suiteEnd, {
			id: suiteId
		});

		if(critical) {
			this.converter.end({});
		}

		this.emit('serverError', error, critical);
	},
	emitter: function (token) {
		return this.instances[token];
	}
});

module.exports = TestServer;
