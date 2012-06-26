var connect = require('connect'),
	server = connect().use(connect.static(__dirname + '/../')).listen(3996),
	io = require('socket.io').listen(server),
	writers = require('./writers');

io.configure(function(){
	// Socket.io configuration
	io.enable('browser client etag');
	io.set('log level', 1);

	io.set('transports', [
		'xhr-polling'
		, 'websocket'
		, 'flashsocket'
		, 'htmlfile'
		, 'jsonp-polling'
	]);
});

io.sockets.on('connection', function(socket) {
	// Hook up the console writer to the socket event emitter and stdout as the output stream
	writers.logger(socket, process.stdout);
});
