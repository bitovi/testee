var injector = require('connect-injector');
var debug = require('debug')('testee:html-injector');

// Returns a middleware that injects the SocketIO JavaScript
// and a link to the clients side adapters into any HTML file
module.exports = function(configuration) {
  return injector(function(req, res) {
    var header = res.getHeader('content-type');
    if(res._header) {
      var matches = res._header.match(/content-type:[\s*](.*)/i);
      header = matches && matches[1];
    }
    return header && (header.indexOf('text/html') === 0);
  }, function(data, req, res, callback) {
    debug('injecting scripts into file', req.url);
    var html = data.toString().replace('</body>',
        '<script type="text/javascript" src="/socket.io/socket.io.js"></script>' +
        '<script type="text/javascript" src="' + configuration.adapter + '"></script>\n' +
        '</body>');
    callback(null, html);
  });
};
