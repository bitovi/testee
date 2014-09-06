var injector = require('connect-injector');

module.exports = function(configuration) {
  return injector(function(req, res) {
    var header = res.getHeader('content-type');
    if(res._header) {
      var matches = res._header.match(/content-type:[\s*](.*)/i);
      header = matches && matches[1];
    }
    return header && (header.indexOf('text/html') === 0);
  }, function(data, req, res, callback) {
    var html = data.toString().replace('</body>',
        '<script type="text/javascript" src="/socket.io/socket.io.js"></script>' +
        '<script type="text/javascript" src="' + configuration.adapter + '"></script>\n' +
        '</body>');
    callback(null, html);
  });
};
