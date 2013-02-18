var httpProxy = require('http-proxy');
var proxy = new httpProxy.RoutingProxy();

module.exports = function (settings) {
	// This closure is returned as the request handler.
	return function (req, res) {
		// If routing to a server on another domain, the hostname in the request must be changed.
		req.headers.host = settings.host;
		// Once any changes are taken care of, this line makes the magic happen.
		return proxy.proxyRequest(req, res, settings);
	}
}