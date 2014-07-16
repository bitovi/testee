var httpProxy = require('http-proxy');

module.exports = function(settings) {
  var proxy = httpProxy.createProxyServer(settings.config || {});
  var port = settings.port ? ':' + settings.port : '';

  return function(req, res) {
    // If routing to a server on another domain, the hostname in the request must be changed.
    req.headers.host = settings.host;
    proxy.web(req, res, {
      target: 'http://' + settings.host + port
    });
  }
};
