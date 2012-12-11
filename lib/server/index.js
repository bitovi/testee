"use strict";

var _ = require('underscore');
var connect = require('connect');
var fs = require('fs');

var logger = require('../utils').getLogger();
var injector = require('./static');
var socketioHandler = require('./socketio');
var Server = require('./server');

var defaults = {
	// The key of the authentication token
	token : '__token',
	exitEvent : 'end',
	adapterPath : '__testee',
	adapters : 'testee.js',
	root : process.cwd()
};

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
		logger.debug('Creating server with configuration', config);
		return new Server(config)
			// Statically serves the adapters distributables in the given path
			.use('/' + config.adapterPath, connect['static'](__dirname + '/../../client/dist'))
			// Creates a static fileserver middleware that injects links to socket.io and
			// the Testee client adapter distributable into any HTML page
			.use(injector({
				path : fs.realpathSync(config.root),
				replace : '</body>',
				withText : '<script type="text/javascript" src="/socket.io/socket.io.js"></script>\n' +
					'<script type="text/javascript" src="/' + config.adapterPath + '/' + config.adapters + '"></script>\n' +
					'</body>\n',
				when : function (req, res) {
					return res.getHeader('Content-Type').indexOf('text/html') === 0;
				}
			}))
			.handle(socketioHandler);
	}
};
