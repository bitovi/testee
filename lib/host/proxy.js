var httpProxy = require('http-proxy');

exports.http = function(root, settings) {
  var proxy = httpProxy.createProxyServer(settings.proxy || {});
  var port = root.port ? ':' + root.port : '';

  return function(req, res) {
    // If routing to a server on another domain, the hostname in the request must be changed.
    req.headers.host =  root.hostname;
    proxy.web(req, res, {
      target: root.protocol + '//' + root.hostname + port
    });
  }
};
