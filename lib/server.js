var feathers = require('feathers');
var memory = require('feathers-memory');
var debug = require('debug')('testee:server');

var hosting = require('./host');
var api = exports.api = function() {
  debug('initializing Feathers API');
  return feathers()
    .configure(feathers.rest())
    .configure(feathers.socketio())
    .use('/runs', memory())
    .use('/suites', memory())
    .use('/tests', memory())
    .use('/coverages', memory());
};

// Returns an Express application that hosts a Testee server with the given options:
// `root`: The root URL or path. URLs will be proxied
// `coverage`: If code coverage should be enabled and its settings
exports.create = function(options) {
  // The Feathers API server
  var app = api(options);
  // The file hosting or proxy server
  // Uses the API server as a middleware on the `api/` route
  var host = hosting(options).use('/api', app);
  var oldListen = host.listen;

  host.listen = function() {
    var server = oldListen.apply(this, arguments);
    app.setup(server);
    server.api = app;
    return server;
  };

  return host;
};
