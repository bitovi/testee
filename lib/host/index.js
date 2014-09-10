// Returns an Express application that injects the testing framework adapters into HTML pages
// and either hosts a static directory or proxies to another server
var fs = require('fs');
var path = require('path');
var parse = require('url').parse;
var feathers = require('feathers');

var proxy = require('./proxy');
var coverage = require('./coverage');
var injector = require('./inject');
// The content for the adapter taken from the testee-client dependency
var adapterFile = path.join(__dirname, '..', '..', 'node_modules', 'testee-client', 'dist', 'testee.js');
var adapterContent = fs.readFileSync(adapterFile).toString();

module.exports = function(configuration) {
  var inject = injector(configuration);
  var root = parse(configuration.root);
  var app = feathers()
    // Statically serves the adapters distributables in the given path
    .get(configuration.adapter, function(req, res) {
      res.set('Content-Type', 'text/javascript');
      res.end(adapterContent);
    })
    // Inject links to socket.io and the Testee client adapter distributable into any HTML page
    .use(inject);

  if(configuration.coverage) {
    app.use(coverage(configuration.coverage));
  }

  // Depending on the root URL protocol set up a proxy or file server
  if(root.protocol === 'http:' || root.protocol === 'https:') {
    app.use(proxy.http(root, configuration));
  } else {
    // Use the plain path name
    app.use(feathers.static(configuration.root));
  }

  return app;
};
