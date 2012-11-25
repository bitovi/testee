var _ = require('underscore');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var logger = require('./../utils').getLogger();

/**
 *
 * @param config
 * @constructor
 */
var Converter = function (source, config) {
	// Object ID to instance cache
	this.objects = {};
	this.total = 0;
	this.config = _.extend({
		events : [ 'start', 'suite', 'suite end', 'test', 'pass', 'pending', 'fail', 'test end', 'end' ]
	}, config);
}

util.inherits(Converter, EventEmitter);
_.extend(Converter.prototype, {
	/**
	 * Run the conversion on the events of a given remote emitter
	 *
	 * @param source
	 * @param name
	 */
	run : function (source, name) {
		var self = this;
		var objects = self.objects;
		// Return the key in objects (prefixing the name if applicable)
		var getKey = function (id) {
			var prefix = name ? name + ':' : '';
			return prefix + id;
		}
		// Function that prints the title
		var titleFn = function () {
			var title = this.title || '';
			if (this.parent) {
				title = this.parent.fullTitle() + self.titleSeparator + title;
			}
			return title;
		};
		// Update the total test count
		var updateTotal = function () {
			self.total++;
		};

		this.config.events.forEach(function (name) {
			source.on(name, function (data) {
				logger.debug('"' + name + '"', data);
				if (data && (data.id !== undefined)) {
					var key = getKey(data.id);
					if (!objects[key]) {
						objects[key] = _.extend({}, self.defaults[name]);
					}
					_.extend(objects[key] || {}, data);

					var ref = objects[key];
					var args = [name, ref];

					ref.fullTitle = ref.fullTitle || titleFn;
					ref.fn = ref.fn || '';

					if (data.parent) {
						ref.parent = objects[getKey(data.parent)];
					}

					if (data.err) {
						var error = new Error(data.err.message);
						error.stack = data.err.stack;
						args.push(error);
					}

					self.emit.apply(self, args);
				} else {
					self.emit.call(self, name, data);
				}
			});
		});

		source.on('test', updateTotal);
		source.on('pending', updateTotal);
	},
	titleSeparator : ' / ',
	defaults : {
		"suite" : {
			title : '',
			root : false,
			pending : false
		},
		"test" : {
			async : false,
			pending : false,
			type : 'test'
		},
		"pass" : {
			duration : 0,
			state : 'passed',
			speed : 'fast'
		},
		"fail" : {
			duration : 0,
			state : 'failed',
			speed : 'fast'
		},
		"pending" : {
			sync : true,
			pending : true,
			type : 'test'
		}
	}
});


module.exports = Converter;
