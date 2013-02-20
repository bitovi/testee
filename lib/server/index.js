'use strict';

var _ = require('underscore');
var connect = require('connect');
var injector = require('connect-injector');

var utils = require('../utils');
var logger = utils.getLogger();
var socketio = require('./http/socketio');
var Server = require('./server');
var proxy = require('./http/proxy');
var extensions = require('./extensions');
var defaults = require('./defaults.json');

module.exports = {
	Server: Server,
	socketio: socketio,
	injector: injector,
	extensions: extensions,
	/**
	 * Creates a Testee server that handles SocketIO by default. Serves the
	 * client adapters JavaScript in a given `adapterPath` and creates a static file server
	 * or http proxy for the given `root`.
	 *
	 * The file server injects links to the SocketIO and adapter JavaScript
	 * files into any HTML page before the </body> tag.
	 *
	 * Also loads all server extensions. And extension is just a module that provides
	 * a `setup` method taking the server instance as a parameter.
	 *
	 * @param {Object} settings The server configuration that will be merged with the defaults.
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
			.handle(socketio);

		logger.debug('Creating server with configuration', config);

		// Load server extensions
		extensions.forEach(function(extension) {
			extension.setup(server);
		});

		// Depending on the root URL protocol set up a proxy or file server
		if (!root.protocol || root.protocol === 'file:') {
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

		return server;
	}
};
