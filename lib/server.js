var _ = require('lodash');
var feathers = require('feathers');
var memory = require('feathers-memory');

var hosting = require('./host');
var reporter = require('./reporter');
var api = exports.api = function() {
  return feathers()
    .configure(feathers.rest())
    .configure(feathers.socketio())
    .use('/runs', memory())
    .use('/suites', memory())
    .use('/tests', memory())
    .use('/coverage', memory());
};

// Starts a Testee server with the given options:
// `port`: The port to run on
// `root`: The root URL or path. URLs will be proxied
// `reporter`: The Mocha reporter to use (if any)
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
