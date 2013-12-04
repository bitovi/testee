var testee = require('../lib/testee');
var async = require('async');
var _ = require('underscore');

module.exports = function(grunt) {
	grunt.registerMultiTask('testee', 'Run tests', function() {
		var done = this.async();

		var opts = this.options({
			urls: [],
			browsers: []
		});

		var workers = _.map(opts.browsers || ["phantom"], function(browser) {
			var testeeOptions = _.extend({
				browser: browser
			}, _.omit(opts, 'browsers', 'urls'));

			return function(callback) {
				grunt.log.writeln('Running testee on ' + browser, testeeOptions);
				testee.test(opts.urls[0], testeeOptions, function(err, stats) {
					if (err || (stats && stats.failed)) {
						callback(new Error(err || ((stats && stats.failed) +
												   " tests failed.")));
					} else {
						callback();
					}
				});
			};
		});

		async.series(workers, done);
	});
};
