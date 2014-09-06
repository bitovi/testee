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
  bootstrap: function() {
    if(!this.options.reporter) {
      return Q.reject(new Error('No reporter set. Maybe you want to run only the server?'));
    }

    var self = this;
    // Otherwise we need to initialize the reporter first (in case of errors)
    var reporter = new Reporter(this.options.reporter);
    // A deferred that runs the initialization flow
    var flow = this.startServer()
      // Sets up the reporter and binds Feathers service events to it
      .then(function setupReporter() {
        // Bind Feathers service .lookup
        var lookup = self.api.lookup.bind(self.api);
        reporter.setup(lookup('runs'), lookup('suites'), lookup('tests'));

        self.reporter = reporter;
      })
      // Sets up the localhost tunneling service
      .then(self.setupTunnel.bind(self))
      // Sets up the Browser launching environment
      .then(self.setupLauncher.bind(self))
      .then(function setupRunner() {
        self.runner = new Runner(_.extend({
          timeout: self.options.timeout,
          delay: self.options.delay,
          runs: self.api.lookup('runs')
        }, _.pick(self, 'tunnel', 'launcher')));
      })
      .fail(function(e) {
        reporter.error(e);
        return self.shutdown();
      })
      .thenResolve(self);

    return flow;
  },

  startServer: function() {
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
      this.server = server;
      this.api = server.api;
    }.bind(this));
  },

  setupTunnel: function() {
    var tunnelOptions = this.options.tunnel;
    var type = tunnelOptions.type;

    if(!miner[type]) {
      return Q.reject(new Error('Localhost tunnel ' + type + ' not supported.'));
    }

    return Q.nfcall(miner[type], _.omit(tunnelOptions, 'type'))
      .then(function(url, process) {
        this.tunnel = {
          url: url,
          process: process,
          makeUrl: function(path, params) {
            return utils.makeUrl(url, path, params);
          }
        }
      }.bind(this));
  },

  setupLauncher: function() {
    var launcherOptions = this.options.launch;
    var type = launcherOptions.type;

    if(!launchpad[type]) {
      return Q.reject(new Error('Launchpad launcher ' + type + ' not supported.'));
    }

    return Q.nfcall(launchpad[type], _.omit(launcherOptions, 'type')).then(function(launcher) {
      this.launcher = launcher;
    }.bind(this));
  },

  test: function(files, browsers) {
    var self = this;

    return this.runner.test(files, browsers).then(function(results) {
      results.forEach(function(current) {
        if(current instanceof Error) {
          self.reporter.error(current);
        }
      });
      return results;
    }).finally(function() {
      return self.shutdown();
    });
  },

  shutdown: function() {
    if(this.reporter) {
      this.reporter.end();
    }

    if(this.tunnel && this.tunnel.process) {
      this.tunnel.process.kill();
    }

    if(this.server) {
      return Q.ninvoke(this.server, 'close');
    }

    return Q();
  }
});

exports.Manager = Testee;

exports.server = function(options) {
  return new Testee(options).startServer();
};

exports.test = function(files, browsers, options) {
  var environment = new Testee(options);

  return environment.bootstrap().then(function() {
    return environment.test(files, browsers);
  }).fail(function(e) {
    console.error(e.stack);
  });
};
