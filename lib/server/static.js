"use strict";

var url = require('url');
var send = require('send');
var fs = require('fs');
var logger = require('../utils').getLogger();

// # Fileserver
//
// A fileserver middleware that can inject content into a text file stream
// when certain criteria are matched.
//
// ```javascript
// var fileServer = require('./file-server');
// var middleware = fileServer({
//   path : './client',
//   replace '<body>',
//   withText : '<body>Stuff',
//   when : function(req, res) {
//     //  Return true when the criteria are matched
//   }
// })
module.exports = function (params) {
	return function (request, response) {
		var sender = send(request, url.parse(request.url).pathname).root(params.path);
		sender.stream = function (path, options) {
			var self = this;
			var res = this.res;
			var req = this.req;

			// pipe
			var stream = fs.createReadStream(path, options);
			this.emit('stream', stream);
			if (params.replace && params.withText && typeof params.when === 'function' && params.when.call(this, req, res)) {
				logger.debug('Matched condition for request ' + request.url + '. Buffering file and replacing text.');
				var buffer = '';
				stream.on('data', function (buf) {
					buffer += buf.toString();
				});
				stream.on('end', function () {
					var replaced = buffer.replace(new RegExp(params.replace, 'g'), params.withText);
					res.setHeader('Content-Length', replaced.length);
					res.end(replaced);
				});
			} else {
				stream.pipe(res);
			}

			// socket closed, done with the fd
			req.on('close', stream.destroy.bind(stream));

			// error handling code-smell
			stream.on('error', function (err) {
				logger.error('Injector: Error in stream', err);
				// no hope in responding
				if (res._header) {
					console.error(err.stack);
					req.destroy();
					return;
				}

				// 500
				err.status = 500;
				self.emit('error', err);
			});

			// end
			stream.on('end', function () {
				self.emit('end');
			});
		};
		sender.pipe(response);
	};
};
