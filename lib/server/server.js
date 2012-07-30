var connect = require('connect'),
	socketio = require('socket.io'),
	EventEmitter = require('events').EventEmitter;

var Server = function() {
	this.connect = connect();
}

Server.prototype = Object.create(EventEmitter.prototype);

Server.prototype.use = function() {
	this.connect.use.apply(this.connect, arguments);
	return this;
}

Server.prototype.listen = function(port) {
	this.server = this.connect.listen(port);
	var io = socketio.listen(this.server),
		self = this;
	io.configure(function(){
		// Socket.io configuration
		io.enable('browser client etag');
		io.set('log level', 1);

		io.set('transports', [
			'xhr-polling', 'websocket', 'flashsocket',
			'htmlfile', 'jsonp-polling'
		]);

		io.set('authorization', function (handshakeData, callback) {
			if(self.listeners('authorization').length > 1) {
				// TODO log warning
			}
			self.emit('authorization', handshakeData, callback);
		});
	});

	io.sockets.on('connection', function(socket) {
		self.emit('connection', socket);
	});

	this.io = io;
	return this;
}

module.exports = Server;
