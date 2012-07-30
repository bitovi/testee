var Server = require('./lib/server/server'),
	connect = require('connect'),
	fs = require('fs'),
	writers = require('./lib/server/writers');

var server = new Server();

server.on('authorization', function(handshake, callback) {
	callback(null, true);
});

server.on('connection', function(socket) {
	writers.logger(socket, process.stdout);
});

server.use(function(req, res, next) {
	req.on("static", function(stream) {
		if(stream && res.getHeader('Content-Type') == 'text/html; charset=UTF-8') {
			stream.pipe = function(other) {
				this.on('data', function(buf) {
					console.log(buf.toString());
					var res = buf.toString().replace(/"Module A"/g, '"The test:)"');
					other.write(res);
				});
				this.on('close', function() {
					other.end();
				});
			}
		}
	});
	next();
}).use(connect.static(fs.realpathSync('./client'))).listen(3996);
