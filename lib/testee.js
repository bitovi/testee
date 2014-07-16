var server = require('./server');
var hosting = require('./host');
var reporter = require('./reporter');

// Starts a Testee server with the given options:
// `port`: The port to run on
// `root`: The root URL or path. URLs will be proxied
// `reporter`: The Mocha reporter to use (if any)
exports.server = function(options, callback) {
  var httpServer;
  // The Feathers API server
  var api = server(options);
  // The file hosting or proxy server
  var host = hosting({
      root: options.root
    })
    // Uses the API server as a middleware on the `api/` route
    .use('/api', api);

  // Set up a Mocha command line reporter if set
  if(options.reporter) {
    api.configure(reporter(options.reporter));
  }

  // Start a server on the given port
  httpServer = host.listen(options.port);
  httpServer.on('listening', function() {
    callback(null, api, httpServer);
  });

  // `setup` needs to be called with our server because we
  // are not starting the Feathers server directly
  api.setup(httpServer);
};


exports.testBrowser = function(url, browser, server, callback) {
  if(typeof browser === 'string') {
    browser = { browser: browser };
  }
};

exports.server({
  root: process.cwd(),
  port: 3996,
  reporter: 'Spec'
}, function() {
  console.log(arguments);
});
