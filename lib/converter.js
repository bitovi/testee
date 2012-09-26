var Proto = require('uberproto');
var _ = require('underscore');
var EventEmitter = require('events').EventEmitter;
var Converter = Proto.extend({
	init : function (source, events) {
		var emit = this.proxy('emit');
		// Object ID to instance cache
		// TODO maybe track suites and tests separately
		var objects = {};
		// Function that prints the title
		var titleFn = function() {
			var title = this.title || '';
			if(this.parent) {
				title = this.parent.fullTitle() + ' ' + title;
			}
			return title;
		};

		events = events || [ 'start', 'suite', 'suite end', 'test', 'pass', 'fail', 'test end', 'end' ];
		events.forEach(function (name) {
			source.on(name, function(data) {
				if(data && data.id) {
					objects[data.id] = _.extend(objects[data.id] || {}, data);
					var ref = objects[data.id];
					if(!ref.fullTitle) {
						ref.fullTitle = titleFn;
					}
					if(data.parent) {
						ref.parent = objects[data.parent];
					}
					emit(name, objects[data.id]);
				}
			});
		});
	}
});

Converter.mixin(EventEmitter.prototype);
module.exports = Converter;
