"use strict";

var _ = require('underscore');
var fs = require('fs');
var connect = require('connect');
var mocha = require('mocha');
var async = require('async');
var utils = require('./utils');
var winston = require('winston');
var logger = utils.getLogger();

var launchpad = require('launchpad');
var miner = require('miner');
var Server = require('./server');
var Converter = require('./converter');
var defaults = require('./defaults.json');

/**
 * Create the tunnel using Miner
 *
 * @param config
 * @param callback
 */
var createTunnel = function (config, callback) {
	var settings = { port : config.port };
	var type = config.tunnel.type || config.tunnel;
	if (_.isObject(config.tunnel)) {
		_.extend(settings, config.tunnel);
	}

	logger.debug('Setting up tunnel:', config);
	miner[type](settings, callback);
};

/**
 * Launch a browser using Launchpad
 *
 * @param url
 * @param config
 * @param callback
 */
var launch = function (url, config, callback) {
	var launcherSettings = typeof config.launch === 'string' ? {} : config.launch;
	var type = config.launch.type || config.launch;
	var browserSettings = _.isObject(config.browser) ? config.browser : utils.parseBrowser(config.browser);
	launchpad[type](launcherSettings, function (error, launcher) {
		if (error) {
			return callback(error);
		}

		logger.debug('Launching ' + url + ' on ' + type + ' with:', browserSettings);
		launcher(url, browserSettings, callback);
	});
};

var test = function (file, configuration, callback) {
	var files = Array.isArray(file) ? file : [file];
	var config = _.extend({}, defaults, configuration);

	config.root = fs.realpathSync(config.root);
	if (config.verbose) {
		logger.add(winston.transports.File, {
			filename : config.log,
			json : false
		});
	}

	var server = Server.createServer(_.extend(_.pick(config, 'root', 'reporter'), config.server));
	var getParams = function (token) {
		var result = {};
		result[server.config.token] = token;
		return result;
	};

	logger.debug('Running test with configuration: ', config);

	// First thing: Create the tunnel
	createTunnel(_.pick(config, 'port', 'tunnel'), function (error, hostUrl, tunnel) {
		if (error) {
			return callback(error);
		}
		logger.debug('Tunnel is up at:', hostUrl);

		var converter = new Converter();
		new mocha.reporters[config.reporter](converter);

		converter.start();
		// Create a callback list for each test file
		var tests = files.map(function (filename) {
			return function (callback) {
				if (!utils.validateFilename(config.root, filename)) {
					return callback(new Error(filename + ' does not seem to be within the root directory'));
				}

				// Create a new token. Make sure it's not already registered
				var token = utils.generateToken(_.keys(server.instances));
				// Based on the token, the tunnel URL and the filename we can create the actual URL
				// for launching the browser
				var url = utils.getUrl(hostUrl, filename, getParams(token));
				// Launch the browser
				launch(url, _.pick(config, 'launch', 'browser'), function (error, instance) {
					if (error) {
						return callback(error);
					}

					logger.debug('Browser is running.', instance.id);
					var timeout = setTimeout(function () {
						instance.stop(function () {
							callback(new Error('Browser instance ' + (config.browser.browser || config.browser) +
								' timed out after ' + config.timeout + ' seconds'));
						});
					}, config.timeout * 1000);

					// Register the tokens
					server.register(token, instance);

					instance.on('testing', function (remoteReporter) {
						converter.run(remoteReporter, filename);
						// TODO per test timeout?
						clearTimeout(timeout);
						logger.log('Got test reporter for token ' + token);
						remoteReporter.on(server.config.exitEvent, function () {
							instance.stop(function () {
								logger.debug('Stopped instance', url);
								callback();
							});
						});
					});
				});
			};
		});

		// We can only do serial testing at the moment
		async.series(tests, function(error) {
			converter.on('end', function(stats, objects) {
				callback(error, stats, objects);
			});
			converter.end();
			if(tunnel && tunnel.kill) {
				logger.log('Stopping tunnel process.');
				tunnel.kill();
			}
		});
	});

	server.listen(config.port);
};

module.exports = {
	Server : Server,
	createTunnel : createTunnel,
	defaults : defaults,
	launch : launch,
	test : test
};