var _ = require('underscore');
var fs = require('fs');
var connect = require('connect');
var url = require('url');

var Server = require('./server');
var Converter = require('./converter');
var launch = require('launchpad');
var tunnel = require('miner');

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
var createServer = function(rootPath, settings) {
	// We probably don't need to make this configuratble
	var adapterPath = '__testee';

	// Creates a static fileserver middleware that injects links to socket.io and
	// the Testee client adapter distributable into any HTML page
	var injector = Server.injector({
		path : fs.realpathSync(rootPath),
		replace : '</body>',
		withText : '<script type="text/javascript" src="/socket.io/socket.io.js"></script>\n' +
			'<script type="text/javascript" src="/' + adapterPath + '/adapters.min.js"></script>\n' +
			'</body>\n',
		when : function (req, res) {
			return res.getHeader('Content-Type').indexOf('text/html') === 0;
		}
	});

	return Server.createServer(settings)
		// Statically serves the adapters distributables in the given path
		.use('/' + adapterPath, connect.static(__dirname + '/../client/dist'))
		.use(injector)
		.handle(Server.socketio);
}

var createTunnel = function(config, callback) {
	// TODO tunneling
}

var launch = function(url, config, callback) {
	// TODO browser launching
}

var defaults = {
	test : 'local', // local, remote, browserstack
	// default configuration for local browsers
	remote : {
		username : 'launchpad',
		password : 'password'
	},
	tunnel : 'local', // local, localtunnel, pagekite
	browser : 'phantom',
	root : '.', // HTTP server root
	reporter : 'Spec',
	port : 3996
}

var test = function(file, configuration) {
	var config = _.extend({}, defaults, configuration);
	var server = createServer(config.root);

	var getUrl = function(hostUrl, fileName, token) {
		var params = {};
		var urlData = url.parse(hostUrl);
		params[server.config.token] = token;
		return url.format({
			protocol : urlData.protocol,
			host : urlData.host,
			port : urlData.port,
			query : params,
			pathname : '/' + fileName
		});
	}

	createTunnel(config[config.tunnel] || {}, function(error, hostUrl, process) {
		// TODO multiple tests
		// TODO filename checking (can only be relative to root and no ../)

		// Create a somewhat random token
		var token = Math.random().toString(28).substring(10);
		// Based on the token, the tunnel URL and the filename we can create the actual URL
		var url = getUrl(hostUrl, file, token);
		launch(url, { browser : config.browser }, function(err, instance) {

		});
	});

	server.listen(config.port);
}

module.exports = {
	defaults : defaults,
	createServer : createServer,
	createTunnel : createTunnel,
	launch : launch,
	test : test
}