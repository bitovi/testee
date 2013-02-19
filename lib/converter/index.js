"use strict";

var _ = require('underscore');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var logger = require('./../utils').getLogger();
var Denormalizer = require('./denormalizer');

/**
 * A converter that turns the flat data received from a remote test
 * back into Mocha reporter digestable data.
 *
 * @param source
 * @param config
 * @constructor
 */
var Converter = function (config) {
	this.total = 0;
	this.errorId = 0;
	this.stats = {
		failed: 0,
		passed: 0,
		tests: []
	};
	this.config = _.extend({}, this.constructor.config, config);
	this.denormalizer = new Denormalizer(this.config.separator);

	var events = this.config.events;
	var stats = this.stats;

	this.on(events.fail, function () {
		stats.failed++;
	});

	this.on(events.pass, function () {
		stats.passed++;
	});
};

util.inherits(Converter, EventEmitter);

_.extend(Converter.prototype, {
	start: function (data) {
		this.emit(this.config.events.start, data);
	},
	end: function () {
		this.stats.total = this.total;
		this.emit(this.config.events.end, this.stats, this.denormalizer.objects);
	},
	/**
	 *
	 * @param {EventEmitter} source The remote reporter event emitter
	 * @param name
	 */
	run: function (source, title) {
		var self = this;
		var events = self.config.events;
		// A list of events that should just be passed through the denormalizer
		var passEvents = _.without(_.values(self.config.events), self.config.events.start, self.config.events.end);
		var updateTotal = function () {
			self.total++;
		};

		passEvents.forEach(function (name) {
			source.on(name, function (data) {
				self.convert(name, data, title);
			});
		});

		source.on(events.suite, function(data) {
			self.lastSuiteId = data.id;
		});

		source.on(events.start, function (data) {
			self.stats.tests.push(data);
		});

		source.on(events.test, updateTotal);
		source.on(events.pending, updateTotal);
		return this;
	},
	/**
	 *
	 * @param name
	 * @param data
	 * @param prefix
	 * @return {*}
	 */
	convert: function (name, data, prefix) {
		var args = this.denormalizer.convert(data, this.config.defaults[name], prefix || '');
		logger.debug('"' + name + '"', data);
		return this.emit.apply(this, [name].concat(args));
	},
	error: function (error, critical) {
		var self = this;
		var events = self.config.events;
		var reporter = new EventEmitter();
		var suiteId = --self.errorId;
		var testId = --self.errorId;

		this.run(reporter);

		reporter.emit(events.suite, {
			id: suiteId,
			title: 'Testee Error',
			root: true
		});

		reporter.emit(events.test, {
			id: testId,
			title: error.message
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
			this.end({});
			process.exit();
		}
	}
});

// Load the converter default configuration
Converter.config = require('./defaults.json');
module.exports = Converter;
