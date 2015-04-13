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
  var connectionId = 0;
  var connections = {};

  host.listen = function() {
    var server = oldListen.apply(this, arguments);
    app.setup(server);
    server.api = app;
    //Track all connections, remove them when the are closed.
    server.on('connection', function(conn){
        var key = connectionId++;
        connections[key] = conn;
        conn.on('close', function(){
            delete connections[key];
        });
    });
    //Any open connection will be destroyed
    server.destroy = function(cb){
        server.close(cb || function(){});
        for(var key in connections) {
            connections[key].destroy();
            delete connections[key];
        }
    };
    return server;
  };

  return host;
};
