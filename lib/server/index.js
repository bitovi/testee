"use strict";

var _ = require('underscore');
var connect = require('connect');
var fs = require('fs');
var url = require('url');
var httpProxy = require('http-proxy');
var injector = require('connect-injector');

var logger = require('../utils').getLogger();
var socketioHandler = require('./socketio');
var Server = require('./server');
var proxy = new httpProxy.RoutingProxy();

var defaults = {
	// The key of the authentication token
	token : '__token',
	exitEvent : 'end',
	adapterPath : '__testee',
	adapters : 'testee.js',
	root : process.cwd()
};

var urlCheck = new RegExp('(http|ftp|https)://[a-z0-9\-_]+(\.[a-z0-9\-_]+)+([a-z0-9\-\.,@\?^=%&;:/~\+#]*[a-z0-9\-@\?^=%&;/~\+#])?', 'i');

module.exports = {
	Server : Server,
	socketio : socketioHandler,
	injector : injector,
	/**
	 * Creates a Testee server that handles SocketIO by default. Serves the
	 * client adapters JavaScript in a given `adapterPath` and creates a static file server
	 * for a given `rootPath`. The file server injects links to the SocketIO and adapter JavaScript
	 * files into any HTML page before the </body> tag.
	 *
	 * @param rootPath
	 * @param config
	 * @return {*}
	 */
	createServer : function(settings) {
		var config = _.extend({}, defaults, settings);
		var inject = injector(function(req, res) {
			return res.getHeader('Content-Type').indexOf('text/html') === 0;
		}, function(callback, data) {
			var html = data.toString().replace('</body>',
				'<script type="text/javascript" src="/socket.io/socket.io.js"></script>\n' +
					'<script type="text/javascript" src="/' + config.adapterPath + '/' + config.adapters + '"></script>\n' +
					'</body>\n');
			callback(null, html);
		});
		var server = new Server(config)
			// Statically serves the adapters distributables in the given path
			.use('/' + config.adapterPath, connect['static'](__dirname + '/../../client/dist'))
			// Inject links to socket.io and the Testee client adapter distributable into any HTML page
			.use(inject)
			// Statically serve the root folder files
			.handle(socketioHandler);

		console.log(config.root, urlCheck.test(config.root));
		if(urlCheck.test(config.root)) {
			var parsed = url.parse(config.root);
			server.use(function (req, res) {
				proxy.proxyRequest(req, res, {
					host: parsed.host,
					port: parsed.port || 80
				});
			});
		} else {
			server.use(connect['static'](config.root));
		}

		logger.debug('Creating server with configuration', config);
		return server;
	}
};
