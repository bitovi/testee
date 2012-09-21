var fileServer = require('./server/static');
var swarm = require('./server');
var launch = require('launchness');
var mocha = require('mocha');
var _ = require('underscore');
var miner = require('miner');

var EventEmitter = require('events').EventEmitter;

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
})


var Converter = function (source, events) {
	var self = this;
	var objects = {};
	var titleFn = function() {
		var title = this.title || '';
		if(this.parent) {
			title = this.parent.fullTitle() + ' ' + title;
		}
		return title;
	};

	events = events || [ 'start', 'suite', 'suite end', 'test', 'pass', 'fail', 'test end', 'end' ];
	events.forEach(function (name) {
		source.on(name, function(data) {
			if(data && data.id) {
				objects[data.id] = _.extend(objects[data.id] || {}, data);
				var ref = objects[data.id];
				if(!ref.fullTitle) {
					ref.fullTitle = titleFn;
				}
				if(data.parent) {
					ref.parent = objects[data.parent];
				}
				self.emit(name, objects[data.id]);
			}
		});
	});
}

// Launch a local browser
//launch.browserstack({
//	username : 'david@bitovi.com',
//	password : 'browsergnom33'
//}, function(err, browserstack) {
//	var token = 'bla';
//	miner.pagekite({ name : 'daff', port : 3996 }, function(err, url) {
//		console.log('Tunnel started at ' + url);
//		console.log('Opening', url + '/mocha.html?__token=' + token);
//		browserstack.firefox(url + '/mocha.html?__token=' + token, { os : 'win' }, function(err, instance) {
//			console.log(arguments);
//			instance.status(function(err, status) {
//				console.log('Instance status is', status);
//				// An instance is an event emitter
//				server.register(token, instance);
//				instance.on('testing', function (reporter) {
//					console.log('Got test reporter for token ' + token);
//					var convertedReporter = new Converter(reporter);
//					new mocha.reporters.Spec(convertedReporter);
//					reporter.on(server.config.exitEvent, function () {
//						console.log('Stopping instance');
//						instance.on('stop', function (status) {
//							console.log('Stopped instance', status);
//							server.close();
//						});
//						instance.stop();
//					});
//					});
//				});
//		});
//	});
//});

Converter.prototype = EventEmitter.prototype;

launch.local({}, function (err, local) {
	var token = 'bla';
	local.firefox('http://localhost:3996/mocha.html?__token=' + token, {}, function (err, instance) {
		server.register(token, instance);
		instance.on('testing', function (reporter) {
			console.log('Got test reporter for token ' + token);
			var convertedReporter = new Converter(reporter);
			new mocha.reporters.JSON(convertedReporter);
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
