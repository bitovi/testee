var fileServer = require('./static-inject');
var swarm = require('swarmness');
var launch = require('launchness');
var miner = require('miner');
var mocha = require('mocha');

var fsMiddleware = fileServer({
	path : './client',
	replace : '</body>',
	withText : '<script type="text/javascript" src="/socket.io/socket.io.js"></script>\n' +
		'<script type="text/javascript" src="/mocha-adapter.js"></script>\n' +
		'</body>\n',
	when : function(req, res) {
		return res.getHeader('Content-Type').indexOf('text/html') === 0;
	}
});

var server = swarm.createServer({
	events : ['start', 'suite', 'suite end', 'test', 'pass', 'fail', 'test end', 'end', 'funnyEvent']
}).use(fsMiddleware).handle(swarm.socketio);
server.listen(3996);

server.on('close', function() {
	process.exit();
})

// Launch a local browser
//launch.browserstack({
//	username : 'david@bitovi.com',
//	password : 'browsergnom33'
//}, function(err, browserstack) {
//	var token = 'bla';
//	miner.pagekite({ name : 'daff', port : 3996 }, function(err, url) {
//		console.log('Tunnel started at ' + url);
//		console.log('Opening', url + '/qunit.html?__token=' + token);
//		browserstack.safari(url + '/qunit.html?__token=' + token, { os : 'win' }, function(err, instance) {
//			console.log(arguments);
//			instance.status(function(err, status) {
//				console.log('Instance status is', status);
//				// An instance is an event emitter
//				server.register(token, instance);
//				swarm.write.console(instance, process.stdout);
//				instance.on('testRunnerExit', function() {
//					instance.stop();
//					instance.on('stop', function(status) {
//						console.log('Stopped instance', status);
//						server.close();
//					})
//				});
//			});
//		});
//	});
//});

launch.local({}, function(err, local) {
	var token = 'bla';
	local.firefox('http://localhost:3996/mocha.html?__token=' + token, {}, function(err, instance) {
		server.register(token, instance);
		new mocha.reporters.Spec(instance);
		instance.on('funnyEvent', function(data) {
			console.log('At least artign', data);
		})
		instance.on('end', function() {
			instance.stop();
			instance.on('stop', function(status) {
				console.log('Stopped instance', status);
				server.close();
			})
		});
	});
});

new mocha.reporters.Base(server);
