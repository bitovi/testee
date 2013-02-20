'use strict';

var _ = require('underscore');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var logger = require('./../utils').getLogger();
var Denormalizer = require('./denormalizer');

/**
 * A converter that turns the noramlized data received from a remote test
 * back into Mocha reporter digestable data.
 *
 * @param {Object} config The converter configuration (event names and default values)
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
	/**
	 * Emit the global start event. Test start and end
	 * will be handled separately so that we can report more
	 * than one test at once.
	 *
	 * @param {Object} [data] The event data.
	 * @return {Converter}
	 */
	start: function (data) {
		this.emit(this.config.events.start, data);
		return this;
	},
	/**
	 * Emit the global end event. Will emit the local statistics
	 * and the denormalized objects.
	 *
	 * @return {Converter}
	 */
	end: function () {
		this.stats.total = this.total;
		this.emit(this.config.events.end, this.stats, this.denormalizer.objects);
	},
	/**
	 * Convert the reports from a source event emitter.
	 *
	 * @param {EventEmitter} source The source event emitter
	 * @param {String} title A prefix to use, mainly so that there aren't
	 * id conflicts.
	 */
	run: function (source, title) {
		var self = this;
		var events = self.config.events;
		// A list of events that should just be passed through the denormalizer
		var passEvents = _.without(_.values(events), events.start, events.end);
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
	 * Use the denormalizer to convert the given event data back
	 * to a Mocha reporter compatible format.
	 *
	 * @param {String} name The name of the event
	 * @param {Object} data The event data
	 * @param {String} [prefix] A prefix to use for preventing id conflicts
	 * @return {*} The event emitter result
	 */
	convert: function (name, data, prefix) {
		var args = this.denormalizer.convert(data, this.config.defaults[name], prefix || '');
		return this.emit.apply(this, [name].concat(args));
	}
});

// Load the converter default configuration
Converter.config = require('./defaults.json');
module.exports = Converter;
