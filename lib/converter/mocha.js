var _ = require('underscore');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var logger = require('../utils').getLogger();

/**
 * A converter that turns the flat data received from a source remote test runned
 * back into Mocha reporter digestable data.
 *
 * @param source
 * @param config
 * @constructor
 */
var Converter = function(source, config) {
	this.total = 0;
	this.config = _.extend({
		events : [ 'start', {
				name : 'suite',
				addParent : true
			}, {
				name : 'test',
				addParent : true
			}, 'suite end', 'pass', 'pending', 'fail', 'test end', 'end' ],
		objects : {},
		prefix : ''
	}, config);

	var self = this;
	// Object ID to instance cache
	var objects = this.config.objects;
	// Returns a prefixed key for objects
	var getKey = function(id) {
		return self.config.prefix + id;
	}
	// Function that prints the title
	var titleFn = function() {
		var title = this.title || '';
		if(this.parent) {
			title = this.parent.fullTitle() + self.titleSeparator + title;
		}
		return title;
	};
	var updateTotal = function() {
		self.total++;
	};


	self.config.events.forEach(function (val) {
		var name = val.name || val;
		source.on(name, function(data) {
			logger.debug('"' + name + '"', data);
			if(data && (data.id !== undefined)) {
				var key = getKey(data.id);
				if(!objects[key]) {
					objects[key] = _.extend({}, self.defaults[name]);
				}
				_.extend(objects[key] || {}, data);

				var ref = objects[key];
				var args = [name, ref];

				ref.fullTitle = ref.fullTitle || titleFn;
				ref.fn = ref.fn || '';

				if(data.parent) {
					ref.parent = objects[getKey(data.parent)];
				}

				if(data.err) {
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
}

util.inherits(Converter, EventEmitter);
_.extend(Converter.prototype, {
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
