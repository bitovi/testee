"use strict";

var _ = require('underscore');
var connect = require('connect');
var injector = require('connect-injector');
var instrumenter = new (require('istanbul').Instrumenter)();
var minimatch = require('minimatch');

var utils = require('../utils');
var logger = utils.getLogger();
var socketioHandler = require('./socketio');
var Server = require('./server');
var coverageHook = require('./hooks/coverage');
var proxy = require('./proxy');

var defaults = {
	// The key of the authentication token
	token: '__token',
	exitEvent: 'end',
	startEvent: 'start',
	adapterPath: '__testee',
	adapters: 'testee.js'
};

module.exports = {
	Server: Server,
	socketio: socketioHandler,
	injector: injector,
	hooks: {
		coverage: coverageHook
	},
	/**
	 * Creates a Testee server that handles SocketIO by default. Serves the
	 * client adapters JavaScript in a given `adapterPath` and creates a static file server
	 * or http proxy for the given `root`.
	 * The file server injects links to the SocketIO and adapter JavaScript
	 * files into any HTML page before the </body> tag.
	 *
	 * @param rootPath
	 * @param config
	 * @return {*}
	 */
	createServer: function (settings) {
		var config = _.extend({}, defaults, settings);
		var root = config.root;
		var inject = injector(function (req, res) {
			return res.getHeader('content-type').indexOf('text/html') === 0;
		}, function (callback, data, req, res) {
			utils.unzip(res, data, function(error, data) {
				if(error) {
					return callback(error);
				}

				var html = data.toString().replace('</body>',
					'<script type="text/javascript" src="/socket.io/socket.io.js"></script>\n' +
						'<script type="text/javascript" src="/'
						+ config.adapterPath + '/' + config.adapters + '"></script>\n' +
						'</body>\n');
				callback(null, html);
			});
		});

		var server = new Server(config)
			// Statically serves the adapters distributables in the given path
			.use('/' + config.adapterPath, connect['static'](__dirname + '/../../client/dist'))
			// Inject links to socket.io and the Testee client adapter distributable into any HTML page
			.use(inject)
			// Handle SocketIO
			.handle(socketioHandler);

		if (config.coverage) {
			var ignores = config.coverage.ignore || [];
			// Test coverage for JS files
			server.use(injector(function (req, res) {
				var isIgnored = _.some(ignores, function (pattern) {
					return minimatch(req.url, pattern);
				});
				return (res.getHeader('content-type').indexOf('application/javascript') === 0 ||
					res.getHeader('content-type').indexOf('application/x-javascript') === 0) &&
					!isIgnored;
			}, function (callback, data, req, res) {
				utils.unzip(res, data, function(error, data) {
					if(error) {
						return callback(error);
					}

					var parsed = utils.parseUrl(req.url);
					instrumenter.instrument(data.toString(), parsed.pathname, callback)
				});
			}));

			server.hook('coverage', coverageHook);
		}

		if (!root.protocol || root.protocol === 'file:') {
			// Statically serve the root folder files
			server.use(connect['static'](root.path));
		} else if (root.protocol === 'http:') {
			server.use(proxy({
				port: root.port || 80,
				host: root.hostname
			}));
		} else if (root.protocol === 'https:') {
			throw new Error('Https support coming soon...');
		} else {
			throw new Error('Can not do anything for protocol ' + root.protocol);
		}

		logger.debug('Creating server with configuration', config);
		return server;
	}
};
