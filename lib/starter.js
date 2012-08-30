var connect = require('connect'),
	fileServer = require('./server/file'),
	testServer = require('./server/test'),
	launch = require('node-browserlauncher');

var fsMiddleware = fileServer({
	path : './client',
	replace : '</body>',
	withText : '<script type="text/javascript" src="/socket.io/socket.io.js"></script>' +
		'<script type="text/javascript" src="/qunit-adapter.js"></script>' +
		'</body>',
	when : function(req, res) {
		return res.getHeader('Content-Type').indexOf('text/html') === 0;
	}
});

var server = connect().use(fsMiddleware);
var testRunner = testServer(server);
var listener = server.listen(3996);
testRunner.listen(listener);

// Launch a local browser
launch.local(function(err, local) {
	var token = 'bla';
	local.opera('http://localhost:3996/qunit.html?__token=' + token, function(err, instance) {
		// An instance is an event emitter
		testRunner.register(token, instance);
		require('./writers').logger(instance, process.stdout);
		instance.on('QUnit.done', function() {
			instance.stop(function() {
				process.exit(1);
			})
		})
	});
});