var socketio = require('socket.io');
var url = require('url');
var logger = require('../utils').getLogger('SocketIO');

module.exports = function(server) {
	server.on('listening', function(host) {
		var io = socketio.listen(host);
		io.configure(function(){
			// Socket.io configuration
			io.enable('browser client etag');
			io.set('log level', 1);

			io.set('transports', [
				'xhr-polling', 'websocket', 'flashsocket',
				'htmlfile', 'jsonp-polling'
			]);

			io.set('authorization', function (handshakeData, callback) {
				// Try and get a registered emitter from the referer URL token
				var parsed = url.parse(handshakeData.headers.referer || '', true);
				var token = parsed.query[server.config.token];
				if(server.isValid(token)) {
					logger.debug('Authorized token', token);
					// Store the token in global handshakeData
					handshakeData.token = token;
					callback(null, true);
				} else {
					var err = new Error('No registered emitter found for token: ' + token);
					logger.warn(err.message);
					callback(err);
				}
			});
		});

		io.sockets.on('connection', function(socket) {
			var token = socket.handshake.token;
			logger.debug('got valid connection, firing the testing event.', {
				token : token
			});
			// TODO although we can be fairly certain, we should probably make sure
			// that the emitter actually exists
			server.emitter(token).emit('testing', socket);
		});
	});
}
