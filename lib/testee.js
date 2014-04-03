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
var defaults = require('./defaults.json');

/**
 * Create the tunnel using Miner
 *
 * @param config
 * @param callback
 */
var createTunnel = function (config, callback) {
	var settings = { port: config.port };
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

		if(config.debug) {
			var _url = require('url').parse(url);
			console.log('\nTest url: ', _url.protocol + '//' + _url.host + _url.pathname + '\n');
		}
		else {
			launcher(url, browserSettings, callback);
		}
	});
};

var createServer = function (file, config) {
	var root = utils.getRoot(file, config.root);
	var server = Server.createServer(_.extend(_.pick(config, 'reporter', 'coverage', 'timeout', 'debug'),
		config.server, { root: root }));
	server.listen(config.port);
	process.on('uncaughtException', function(err) {
		server.error(err, 'Uncaught Exception', true);
	});
	return server;
}

var test = function (file, configuration, callback) {
	var files = Array.isArray(file) ? file : [file];
	var config = _.extend({}, defaults, configuration);

	if (config.verbose) {
		// logger.add(winston.transports.File, {
		// 	filename: config.log,
		// 	json: false
		// });
	}

	var getParams = function (token, query) {
		var result = _.extend({}, query);
		result[server.config.token] = token;
		return result;
	};

	var server = createServer(files[0], config);

	server.on('serverError', function(error, critical) {
		if(critical) {
			process.exit();
		} else {
			callback(error);
		}
	});

	// logger.debug('Running test with configuration: ', config);
	
	server.on('listening', function () {
		// First thing: Create the tunnel
		createTunnel(_.pick(config, 'port', 'tunnel'), function (error, hostUrl, tunnel) {
			if (error) {
				server.error('Tunnel', error, true);
				return;
			}
			logger.debug('Tunnel is up at:', hostUrl);

			// Create a callback list for each test file
			var tests = files.map(function (filename) {
				return function (callback) {
					filename = utils.parseUrl(filename, true);
					// Create a new token. Make sure it's not already registered
					var token = utils.generateToken(_.keys(server.instances));
					// Based on the token, the tunnel URL and the filename we can create the actual URL
					// for launching the browser
					var url = utils.getUrl(hostUrl, filename.path, getParams(token, filename.query));
					// Launch the browser
					launch(url, _.pick(config, 'launch', 'file', 'browser', 'debug'), function (error, instance) {
						if (error) {
							return callback(error);
						}

						if(config.verbose) {
							var process = instance.process;
							var stdout = process.stdout;
							var stderr = process.stderr;

							[stdout, stderr].forEach(function(stream, idx) {
								var which = idx === 0 ? 'stdout'  : 'stderr';
								stream.setEncoding('utf8');
								stream.on('data', function(data) {
									logger.debug('Browser', which + ':', data);
								});
							});
						}

						// Register the tokens
						server.register(token, instance);
						instance.on('testing', function (remoteReporter) {
							logger.log('Got test reporter for token ' + token);
							remoteReporter.on(server.config.exitEvent, function () {
								instance.stop(function (error) {
									logger.debug('Stopped instance', url);
									callback(error);
								});
							});
						});
					});
				};
			});

			// We can only do serial testing at the moment
			async.series(tests, function (error) {
				if(error) {
					server.error(error);
				}

				server.converter.on('end', function (stats, objects) {
					callback(error, stats, objects);
				});
				server.converter.end();
				if (tunnel && tunnel.kill) {
					logger.log('Stopping tunnel process.');
					tunnel.kill();
				}
			});
		});
	});

	server.converter.start();
};

module.exports = {
	Server: Server,
	createTunnel: createTunnel,
	defaults: defaults,
	launch: launch,
	test: test
};
