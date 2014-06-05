// Returns an Express application that injects the testing framework adapters into HTML pages
// and either hosts a static directory or proxies to another server
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var feathers = require('feathers');

var injector = require('./inject');
var adapterFile = path.join(__dirname, '..', '..', 'node_modules', 'testee-client', 'dist', 'testee.js');
var adapterContent = fs.readFileSync(adapterFile).toString();
var defaults = {
  adapter: '/testee/testee.js',
  root: process.cwd()
};

module.exports = function(configuration) {
  configuration = _.defaults(configuration || {}, defaults);

  var inject = injector(configuration);
  var root = configuration.root;
  var app = feathers()
    // Statically serves the adapters distributables in the given path
    .get(configuration.adapter, function(req, res) {
      res.set('Content-Type', 'text/javascript');
      res.end(adapterContent);
    })
    // Inject links to socket.io and the Testee client adapter distributable into any HTML page
    .use(inject);

  // Depending on the root URL protocol set up a proxy or file server
  if(!root.protocol || root.protocol === 'file:') {
    app.use(feathers.static(typeof root === 'string' ? root : root.path));
  } else if(root.protocol === 'http:') {
    // TODO Proxy support
    throw new Error('Proxy coming in a second');
  } else if(root.protocol === 'https:') {
    // TODO https support
    throw new Error('Https support coming soon...');
  } else {
    throw new Error('Can not do anything for protocol ' + root.protocol);
  }

  return app;
};

module.exports.defaults = defaults;
