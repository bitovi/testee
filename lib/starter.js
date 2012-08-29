var connect = require('connect'),
	fileServer = require('./server/file'),
	testServer = require('./server/test');

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

var server = connect().use(fsMiddleware).listen(3996);
// Just attach socket.io
testServer(server);
