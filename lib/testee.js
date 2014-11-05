var _ = require('lodash');
var Q = require('q');
var miner = require('miner');
var launchpad = require('launchpad');
var debug = require('debug')('testee:main');

var utils = require('./utils');
var Reporter = require('./reporter');
var Runner = require('./runner');
var server = require('./server');
var getOptions = require('./defaults');

function Testee(options) {
  this.options = getOptions(options);
}

_.extend(Testee.prototype, {
  bootstrap: function() {
    debug('bootstrapping Testee');
    // `bootstrap` can only be called when we want to do command line reporting
    // and browser launching
    if(!this.options.reporter) {
      return Q.reject(new Error('No reporter set. Maybe you want to run only the server?'));
    }

    var self = this;
    // We need to initialize the reporter first (in case of errors)
    var reporter = new Reporter(this.options.reporter, this.options.coverage);
    // A deferred that runs the initialization flow
    var flow = this.startServer()
      // Sets up the reporter and binds Feathers service events to it
      .then(function setupReporter() {
        // Bind Feathers service .lookup
        var lookup = self.api.service.bind(self.api);
        debug('hooking up services to Mocha reporter');
        reporter.setup(lookup('runs'), lookup('suites'), lookup('tests'), lookup('coverages'));

        self.reporter = reporter;
      })
      // Sets up the localhost tunneling service
      .then(self.setupTunnel.bind(self))
      // Sets up the Browser launching environment
      .then(self.setupLauncher.bind(self))
      // Initialize the runner (that actually runs tests on each browser)
      .then(function setupRunner() {
        debug('setting up test runner');
        self.runner = new Runner(_.extend({
          timeout: self.options.timeout,
          delay: self.options.delay,
          runs: self.api.service('runs')
        }, _.pick(self, 'tunnel', 'launcher')));
      })
      // Track bootstrap errors using the reporter
      .fail(function(e) {
        debug('bootstrapping failed. Reporting error', e);
        reporter.error(e);
        return self.shutdown().thenResolve(e);
      })
      .thenResolve(self);

    return flow;
  },

  startServer: function() {
    debug('starting Testee server', this.options);

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
      debug('testee server started and listening');
      this.server = server;
      this.api = server.api;
    }.bind(this));
  },

  setupTunnel: function() {
    var tunnelOptions = this.options.tunnel;
    var type = tunnelOptions.type;
    var result = Q.defer();

    if(!miner[type]) {
      return Q.reject(new Error('Localhost tunnel ' + type + ' not supported.'));
    }

    // We should use `Q.nfcall` here but someone was not Node callback
    // compliant in their library so it doesn't work nicely
    // ps: that someone was me
    debug('starting up localhost tunnel', tunnelOptions);
    miner[type](_.omit(tunnelOptions, 'type'), function(error, url, process) {
      if(error) {
        return result.reject(error);
      }

      debug('localhost tunnel started on', url);

      this.tunnel = {
        url: url,
        process: process,
        makeUrl: function(path, params) {
          return utils.makeUrl(url, path, params);
        }
      };

      result.resolve(this.tunnel);
    }.bind(this));

    return result.promise;
  },

  setupLauncher: function() {
    var launcherOptions = this.options.launch;
    var type = launcherOptions.type;

    if(!launchpad[type]) {
      return Q.reject(new Error('Launchpad launcher ' + type + ' not supported.'));
    }

    debug('using browser launcher', type, launcherOptions);
    return Q.nfcall(launchpad[type], _.omit(launcherOptions, 'type'))
      .then(function(launcher) {
        debug('browser launcher initialized');
        this.launcher = launcher;
      }.bind(this));
  },

  test: function(files, browsers) {
    var self = this;

    return this.runner.test(files, browsers).fail(function(results) {
      var errors = 0;
      var failures = 0;

      results.forEach(function(current) {
        if(current instanceof Error) {
          self.reporter.error(current);
          errors++;
        } else {
          failures += current.failed;
        }
      });
      throw new Error('There were ' + errors + ' general errors and ' + failures + ' total test failures.');
    }).finally(function() {
      return self.shutdown();
    });
  },

  shutdown: function() {
    if(this.reporter) {
      debug('shutting down reporter');
      this.reporter.end();
    }

    if(this.tunnel && this.tunnel.process) {
      debug('killing tunelling process');
      this.tunnel.process.kill();
    }

    if(this.server) {
      debug('closing server');
      // Todo this does take a callback but sometimes
      // simply never returns even when cleanly shutting down
      // all connections
      this.server.close();
    }

    return Q();
  }
});

exports.Manager = Testee;

exports.server = function(options) {
  return new Testee(options).startServer();
};

exports.test = function(files, browsers, options) {
  debug('running test for', files, browsers, options);
  var environment = new Testee(options);

  return environment.bootstrap().then(function() {
    debug('server bootstrapped, running tests.');
    return environment.test(files, browsers);
  });
};
