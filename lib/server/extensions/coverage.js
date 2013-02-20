'use strict';

var _ = require('underscore');
var istanbul = require('istanbul');
var minimatch = require('minimatch');
var instrumenter = new istanbul.Instrumenter();
var utils = require('../../utils');
var injector = require('connect-injector');

var hook = exports.hook = function (server, coverageObject) {
	// TODO html-cov etc.
	var report = istanbul.Report.create('text');
	var collector = new istanbul.Collector();

	collector.add(coverageObject);
	report.writeReport(collector);
};

var middleware = exports.middleware = function (config) {
	var ignores = config.ignore || [];
	return injector(function (req, res) {
		var isIgnored = _.some(ignores, function (pattern) {
			return minimatch(req.url, pattern);
		});
		return (res.getHeader('content-type').indexOf('application/javascript') === 0 ||
			res.getHeader('content-type').indexOf('application/x-javascript') === 0) &&
			!isIgnored;
	}, function (callback, data, req, res) {
		utils.unzip(res, data, function (error, data) {
			if (error) {
				return callback(error);
			}

			var parsed = utils.parseUrl(req.url);
			instrumenter.instrument(data.toString(), parsed.pathname, callback);
		});
	});
}

exports.setup = function (server) {
	var config = server.config.coverage;
	if (config) {
		server.use(middleware(config));
		server.hook('coverage', hook);
	}
}
