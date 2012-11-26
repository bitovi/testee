var _ = require('underscore');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var logger = require('./../utils').getLogger();
var Denormalizer = require('./denormalizer');
var ua = require('ua-parser');

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
	// Keep track of the suites we are inserting for multiple files
	this.suiteId = 0;
	this.config = _.extend({}, this.constructor.config, config);
	this.denormalizer = new Denormalizer(this.config.separator);
}

util.inherits(Converter, EventEmitter);

_.extend(Converter.prototype, {
	finish : function(data) {
		this.emitData(this.config.events.end, data);
	},
	/**
	 *
	 * @param {EventEmitter} source The remote reporter event emitter
	 * @param name
	 */
	run : function (source, title) {
		var self = this;
		var events = self.config.events;
		// A list of events that should just be passed through the denormalizer
		var passEvents = this.handleTest(source, title);
		var updateTotal = function () {
			self.total++;
		};

		passEvents.forEach(function (name) {
			source.on(name, function (data) {
				self.emitData(name, data, title);
			});
		});

		source.on(events.test, updateTotal);
		source.on(events.pending, updateTotal);
		return this;
	},
	/**
	 * Runs for handling multiple tests (usually meaning the `run` method got a title
	 * passed)
	 *
	 * @param source
	 * @param title
	 * @return {*}
	 */
	handleTest : function(source, title) {
		var self = this;
		// The return value is a list of all events that should just be passed through
		var passEvents = _.without(_.values(self.config.events), self.config.events.end);
		var events = self.config.events;
		if(!title) {
			// Anonymous tests just pass all their events through
			return passEvents;
		}

		var suiteId = self.suiteId++;
		// Titled test runs insert a root test suite when the test starts
		source.on(events.start, function(data) {
			var userAgent = ua.parse(data.environment);
			self.emitData(events.start, data);
			self.emitData(events.suite, {
				id : suiteId,
				title : title + ' (' + userAgent + ')',
				root : true
			});
		});

		// If a test suite is reported that doesn't have a parent, make the root suite the parent
		source.on(events.suite, function(data) {
			var pass = _.extend({}, data);
			if(!pass.parent) {
				pass.parent = suiteId;
			}
			self.emitData(events.suite, pass, title);
		});

		// When the remote reporter is done, end the root suite as well
		source.on(events.end, function(data) {
			self.emitData(events.suiteEnd, {
				id : suiteId
			});
		});

		// Returns the events that should be passed through
		return _.without(passEvents, events.start, events.suite);
	},
	emitData : function (name, data, prefix) {
		var args = this.denormalizer.convert(data, this.config.defaults[name], prefix || '');
		logger.debug('"' + name + '"', data);
		return this.emit.apply(this, [name].concat(args));
	},
	error : function (message) {
//		self.emitData(events.fail, {
//			id : currentId
//		})
	}
});

// Load the converter default configuration
Converter.config = require('./defaults.json');
module.exports = Converter;
