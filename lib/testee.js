var _ = require('lodash');
var Q = require('q');
var miner = require('miner');
var launchpad = require('launchpad');

var utils = require('./utils');
var Reporter = require('./reporter');
var Runner = require('./runner');
var server = require('./server');
var getOptions = require('./defaults');


function Testee(options) {
  this.options = getOptions(options);
}

_.extend(Testee.prototype, {
  init: function() {
    var self = this;

    // Server only
    if(this.options.server) {
      return this.startServer();
    }

    // Otherwise we need to initialize the reporter first (in case of errors)
    var reporter = this.options.reporter ? new Reporter(this.options.reporter) : null;
    // The runner object which will be passed through the Deferred flow with all initialized
    // components added to it.
    var runner = new Runner(this.options);

    // A deferred that runs the initialization flow
    var flow = this.startServer(runner)
      // Sets up the reporter and binds Feathers service events to it
      .then(function setupReporter(runner) {
        if(reporter) {
          // Bind Feathers service .lookup
          var lookup = runner.api.lookup.bind(runner.api);
          reporter.setup(lookup('runs'), lookup('suites'), lookup('tests'));

          runner.reporter = reporter;
        }
        return runner;
      })
      // Sets up the localhost tunneling service
      .then(function setupTunnel(runner) {
        return self.createTunnel().then(function(tunnel) {
          runner.tunnel = tunnel;
          return runner;
        });
      })
      // Sets up the Browser launching environment
      .then(function setupLauncher(runner) {
        return self.initLauncher().then(function(launcher) {
          runner.launcher = launcher;
          return runner;
        });
      })
      .fail(function(e) {
        // TODO report error result.reporter
        console.error("Got an error", e);
        console.log(e.stack);

        runner.shutdown();
      });

    return flow;
  },

  startServer: function(state) {
    state = state || {};

    var result = Q.defer();
    var app = server.create(this.options);
    // Start a server on the given port
    var httpServer = app.listen(this.options.port);

    httpServer.once('listening', function() {
      result.resolve(httpServer);
    });

    httpServer.once('error', function(error) {
      result.reject(error);
    });

    return result.promise.then(function(server) {
      state.server = server;
      state.api = server.api;
      return state;
    });
  },

  createTunnel: function() {
    var tunnelOptions = this.options.tunnel;
    var type = tunnelOptions.type;

    if(!miner[type]) {
      return Q.reject(new Error('Localhost tunnel ' + type + ' not supported.'));
    }

    return Q.nfcall(miner[type], _.omit(tunnelOptions, 'type'))
      .then(function(url, process) {
        return {
          url: url,
          process: process,
          makeUrl: function(path, params) {
            return utils.makeUrl(url, path, params);
          }
        }
      });
  },

  initLauncher: function() {
    var launcherOptions = this.options.launch;
    var type = launcherOptions.type;

    if(!launchpad[type]) {
      return Q.reject(new Error('Launchpad launcher ' + type + ' not supported.'));
    }

    return Q.nfcall(launchpad[type], _.omit(launcherOptions, 'type'));
  }
});

exports.Testee = Testee;

exports.test = function(files, browsers, options) {
  new Testee(options).init().then(function(state) {
    if(!options.server) {
      state.test(files, browsers).then(function(data) {
        state.shutdown();
        // process.exit();
      }).fail(function() {
        console.log(arguments);
      });
    }
  });
};
