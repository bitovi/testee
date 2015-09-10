var injector = require('connect-injector');
var debug = require('debug')('testee:html-injector');
var path = require('path');
var url = require('url');
var mime = require('mime-types');

// Returns a middleware that injects the SocketIO JavaScript
// and a link to the clients side adapters into any HTML file
module.exports = function(configuration) {
  return injector(function(req, res) {
    var header = res.getHeader('content-type') || mime.contentType(path.extname(url.parse(req.url).pathname));
    if(res._header) {
      var matches = res._header.match(/content-type:[\s*](.*)/i);
      header = matches && matches[1];
    }
    return header && (header.indexOf('text/html') === 0);
  }, function(data, req, res, callback) {
    debug('injecting scripts into file', req.url);
    var html = data.toString();
    var scripts = '\n<script type="text/javascript" src="' + configuration.adapter + 'bootstrap.min.js"></script>\n' +
      '<script type="text/javascript" src="/socket.io/socket.io.js"></script>' +
      '<script type="text/javascript" src="' + configuration.adapter + 'testee.min.js"></script>\n' +
      '</body>';


    if(html.indexOf('</body>') !== -1) {
      html = data.toString().replace('</body>', scripts);
    } else if(html.indexOf('</script>') !== -1) {
      html += scripts;
    }

    callback(null, html);
  });
};
