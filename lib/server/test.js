var socketio = require('socket.io'),
	writers = require('../writers');

// The test reporting server

module.exports = function(server) {
	var io = socketio.listen(server);
	io.configure(function(){
		// Socket.io configuration
		io.enable('browser client etag');
		io.set('log level', 1);

		io.set('transports', [
			'xhr-polling', 'websocket', 'flashsocket',
			'htmlfile', 'jsonp-polling'
		]);

		io.set('authorization', function (handshakeData, callback) {
			console.log(handshakeData);
			// TODO handle authorization
			callback(null, true);
		});
	});

	io.sockets.on('connection', function(socket) {
		writers.logger(socket, process.stdout);
	});
}
