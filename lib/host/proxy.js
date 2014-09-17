var httpProxy = require('http-proxy');
var debug = require('debug')('testee:http-proxy');

// Returns a middleware that proxies to a remote URL
exports.http = function(root, settings) {
  var proxy = httpProxy.createProxyServer(settings.proxy || {});
  var port = root.port ? ':' + root.port : '';

  return function(req, res) {
    debug('HTTP proxying file', req.url);
    // If routing to a server on another domain, the hostname in the request must be changed.
    req.headers.host = root.hostname;
    proxy.web(req, res, {
      target: root.protocol + '//' + root.hostname + port
    });
  };
};
