var httpProxy = require('http-proxy');
var routingProxy = new httpProxy.RoutingProxy();

var proxy = function(settings) {
  return function(req, res) {
    // If routing to a server on another domain, the hostname in the request must be changed.
    req.headers.host = settings.host;
    return routingProxy.proxyRequest(req, res, settings);
  }
};

app.use(proxy({
  port: root.port || 80,
  host: root.hostname
}));
