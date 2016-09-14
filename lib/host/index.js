// Returns an Express application that injects the testing framework adapters into HTML pages
// and either hosts a static directory or proxies to another server
var path = require('path');
var parse = require('url').parse;
var feathers = require('feathers');
var socketio = require('feathers-socketio');
var debug = require('debug')('testee:hosting');

var proxy = require('./proxy');
var coverage = require('./coverage');
var injector = require('./inject');

module.exports = function(configuration) {
  var inject = injector(configuration);
  var root = parse(configuration.root);
  var clientPath = path.join(require.resolve('testee-client'), '..', '..', 'dist');
  var app = feathers()
    .configure(socketio())
    // Statically serves the adapters distributables in the given path
    //testee-client main is defined as /dist/testee.js, so require will resolve to that subpath
    .use(configuration.adapter, feathers.static(clientPath))
    // Inject links to socket.io and the Testee client adapter distributable into any HTML page
    .use(inject);

  if(configuration.coverage) {
    debug('setting up code coverage', configuration.coverage);
    app.use(coverage(configuration.coverage));
  }

  // Depending on the root URL protocol set up a proxy or file server
  if(root.protocol === 'http:' || root.protocol === 'https:') {
    debug('initializing http proxy');
    app.use(proxy.http(root, configuration));
  } else {
    // Use the plain path name
    debug('intializing static file server', configuration.root);
    app.use(feathers.static(configuration.root));
  }

  return app;
};
