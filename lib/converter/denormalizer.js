var _ = require('underscore');

/**
 * Converts the normalized data (referencing IDs and parent IDs) received from the remote
 * reporter back into an object graph that Mocha reporters can deal with.
 *
 * @param {String} separator
 * @constructor
 */
var Denormalizer = function (separator) {
	this.objects = {};
	this.separator = separator || ' / ';
}

_.extend(Denormalizer.prototype, {
	convert : function (data, defaults, prefix) {
		var separator = this.separator;
		var objects = this.objects;
		// Function that prints the title
		var titleFn = function () {
			var title = this.title || '';
			if (this.parent) {
				title = this.parent.fullTitle() + separator + title;
			}
			return title;
		};
		// Returns a prefixed key for objects
		var getKey = function (id) {
			return (prefix || '') + id;
		};

		if (data && data.id !== undefined) {
			var key = getKey(data.id);
			if (!objects[key]) {
				objects[key] = _.extend({}, defaults);
			}
			_.extend(objects[key] || {}, data);

			var ref = objects[key];
			var args = [ref];

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

			return args;
		}

		return data;
	}
});

module.exports = Denormalizer;
