var fileServer = require('../lib/server/static');
var swarm = require('../lib/server');
var launch = require('launchness');
var mocha = require('mocha');
var _ = require('underscore');
var Converter = require('../lib/converter');
var fsMiddleware = fileServer({
	path : './client',
	replace : '</body>',
	withText : '<script type="text/javascript" src="/socket.io/socket.io.js"></script>\n' +
		'<script type="text/javascript" src="/adapters/underscore.js"></script>\n' +
		'<script type="text/javascript" src="/adapters/qunit-adapter.js"></script>\n' +
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

launch.local({}, function (err, local) {
	var token = 'bla';
	local.firefox('http://localhost:3996/qunit.html?__token=' + token, {}, function (err, instance) {
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
				// instance.stop();
			});
		});
	});
});
