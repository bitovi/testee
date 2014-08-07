var _ = require('lodash');
var Q = require('q');
var utils = require('./utils');

function Runner(options) {
  this.options = options;
}

_.extend(Runner.prototype, {
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
  },

  testOne: function(file, browser) {
    browser = typeof browser === 'string' ? { browser: browser } : browser;

    var timeout = this.options.timeout;
    var testRuns = this.api.lookup('runs');
    // We use a token to identify the browser
    var token = utils.generateToken();
    // Add the token to the URL we are going to launch
    var url = this.tunnel.makeUrl(file, {
      __token: token
    });
    // Returns a Deferred that keeps track of our test run (including timeouts)
    var trackTestRun = function() {
      var dfd = Q.defer();
      var checkToken = new RegExp(token);
      var checkIfRunIsFinished = function(data) {
        // The file property contains the token we added to the browser URL
        if(data.status === 'finished' && checkToken.test(data.file)) {
          testRuns.removeListener('patched', checkIfRunIsFinished);
          dfd.resolve(data);
        }
      };
      var testTimedOut = function() {
        testRuns.removeListener('patched', checkIfRunIsFinished);
        testRuns.removeListener('created', resetTimeout);

        dfd.reject(new Error('Browser ' + JSON.stringify(browser) + ' did not talk to me from ' +
          url + ' within the timeout of ' + timeout + ' seconds'));
      };
      // Sets the test run timeout
      var timer = setTimeout(testTimedOut, timeout * 1000);
      var resetTimeout = function(data) {
        // When a test run with our token has been created we can reset the timeout
        if(checkToken.test(data.file)) {
          testRuns.removeListener('created', resetTimeout);
          clearTimeout(timer);
        }
      };

      testRuns.on('patched', checkIfRunIsFinished);
      testRuns.on('created', resetTimeout);

      return dfd.promise;
    };

    return Q.nfcall(this.launcher, url, browser).then(function(instance) {
      return trackTestRun().finally(function(data) {
        // Shut down the browser instance
        return Q.ninvoke(instance, 'stop').then(function() {
          // Return the test run data
          return data;
        });
      });
    });
  },

  test: function(files, browsers) {
    files = typeof files === 'string' ? [files] : files;
    browsers = typeof browsers === 'string' ? [browsers] : browsers;

    var self = this;
    var delay = this.options.delay;
    // Runs each browser in parallel
    var runners = _.toArray(browsers).map(function(browser) {
      var browserRunner = Q();
      // And each file sequentially for every browser
      _.each(files, function(file) {
        browserRunner = browserRunner.then(function() {
          return self.testOne(file, browser).then(function(test) {
            //
            return Q.delay(delay).then(function() {
              return test;
            })
          });
        });
      });
      return browserRunner;
    });

    return Q.all(runners);
  }
});

module.exports = Runner;
