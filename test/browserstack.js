var fileServer = require('./../lib/server/static');
var swarm = require('./.');
var launch = require('launchness');
var mocha = require('mocha');
var _ = require('underscore');
var miner = require('miner');
var Converter = require('./../lib/converter');
var fsMiddleware = fileServer({
	path : './client',
	replace : '</body>',
	withText : '<script type="text/javascript" src="/socket.io/socket.io.js"></script>\n' +
		'<script type="text/javascript" src="/adapters/underscore.js"></script>\n' +
		'<script type="text/javascript" src="/adapters/mocha-adapter.js"></script>\n' +
		'</body>\n',
	when : function (req, res) {
		return res.getHeader('Content-Type').indexOf('text/html') === 0;
	}
});

var server = swarm.createServer().use(fsMiddleware).handle(swarm.socketio);
server.listen(3996);

server.on('close', function () {
	process.exit();
});

launch.browserstack({
	username : 'david@bitovi.com',
	password : 'browsergnom33'
}, function(err, browserstack) {
	var token = 'bla';
	miner.pagekite({ name : 'daff', port : 3996 }, function(err, url) {
		console.log('Tunnel started at ' + url);
		console.log('Opening', url + '/mocha.html?__token=' + token);
		browserstack.firefox(url + '/mocha.html?__token=' + token, { os : 'win' }, function(err, instance) {
			console.log(arguments);
			instance.status(function(err, status) {
				console.log('Instance status is', status);
				// An instance is an event emitter
				server.register(token, instance);
				instance.on('testing', function (reporter) {
					console.log('Got test reporter for token ' + token);
					var convertedReporter = Converter.create(reporter);
					new mocha.reporters.Spec(convertedReporter);
					reporter.on(server.config.exitEvent, function () {
						console.log('Stopping instance');
						instance.on('stop', function (status) {
							console.log('Stopped instance', status);
							server.close();
						});
						instance.stop();
					});
					});
				});
		});
	});
});
