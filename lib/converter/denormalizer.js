'use strict';

var _ = require('underscore');

/**
 * Converts the normalized data (referencing IDs and parent IDs) received from the remote
 * reporter back into an object graph that Mocha reporters can deal with.
 *
 * @param {String} [separator] The title separator (default is `/`)
 * @constructor
 */
var Denormalizer = function (separator) {
	this.objects = {};
	this.separator = separator || ' / ';
};

_.extend(Denormalizer.prototype, {
	/**
	 * Convert the given data using a set of defaults
	 * and an optional prefix to avoid ID conflicts of
	 * different tests.
	 *
	 * @param {Object} data The normalized data to convert
	 * @param {Object} defaults The default values to use
	 * @param {String} [prefix] The id prefix
	 * @return {Object} The converted data
	 */
	convert: function (data, defaults, prefix) {
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
		var getKey = function (id) {
			// Prefix integer ids (because multiple tests can have the same ids)
			if (typeof id === 'number' && id % 1 === 0) {
				return prefix + ':' + id;
			}
			return id;
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

			if (data.parent !== undefined && data.parent !== null) {
				ref.parent = objects[getKey(data.parent)];
			}

			if (data.err) {
				// Converts errors and makes them the second argument
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
