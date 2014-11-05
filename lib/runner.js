var _ = require('lodash');
var Q = require('q');
var debug = require('debug')('testee:runner');
var utils = require('./utils');

function Runner(options) {
  this.configuration = options;
}

_.extend(Runner.prototype, {
  testOne: function(file, browser) {
    browser = typeof browser === 'string' ? { browser: browser } : browser;

    var timeout = this.configuration.timeout;
    var testRuns = this.configuration.runs;
    // We use a token to identify the browser
    var token = utils.generateToken();
    // Add the token to the URL we are going to launch
    var url = this.configuration.tunnel.makeUrl(file, {
      __token: token
    });
    // The title for potential error messages
    var errorTitle = url + ' on ' + JSON.stringify(browser);
    // Returns a Deferred that keeps track of our test run (including timeouts)
    var trackTestRun = function() {
      debug('tracking test run', url, browser);
      var dfd = Q.defer();
      var checkToken = new RegExp(token);
      var checkIfRunIsFinished = function(data) {
        var status = data.status === 'finished' && checkToken.test(data.file);
        debug('checking if run', url, 'is finished', status);
        // The file property contains the token we added to the browser URL
        if(status) {
          testRuns.removeListener('patched', checkIfRunIsFinished);
          dfd.resolve(data);
        }
      };
      var testTimedOut = function() {
        debug('test', url, 'timed out');
        testRuns.removeListener('patched', checkIfRunIsFinished);
        testRuns.removeListener('created', resetTimeout);

        dfd.reject(new utils.TesteeError(new Error('Browser timed out within ' + timeout + ' seconds'),
          errorTitle));
      };
      // Sets the test run timeout
      var timer = setTimeout(testTimedOut, timeout * 1000);
      var resetTimeout = function(data) {
        debug('checking if browser timeout can be reset', url, checkToken.test(data.file));
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

    debug('running individual test', url, browser);
    return Q.nfcall(this.configuration.launcher, url, browser).then(function(instance) {
      debug('browser instance started', browser);
      var debugData = function(data) {
        debug(data.toString(), url, browser);
      };

      if(instance.stdout) {
        instance.stdout.on('data', debugData);
      }

      if(instance.stderr) {
        instance.stderr.on('data', debugData);
      }

      return trackTestRun().finally(function() {
        debug('stopping browser instance', browser);
        // Shut down the browser instance
        return Q.ninvoke(instance, 'stop');
      });
    }, function(error) {
      throw new utils.TesteeError(error, errorTitle);
    });
  },

  test: function(files, browsers) {
    debug('running tests for', files, browsers);
    files = typeof files === 'string' ? [files] : files;
    browsers = typeof browsers === 'string' ? [browsers] : browsers;

    var self = this;
    var result = Q.defer();
    var delay = this.configuration.delay;
    // Runs each browser in parallel
    var runners = _.toArray(browsers).map(function(browser) {
      debug('initializing sequential test runs for browser', browser);
      var browserRunner = Q();
      var results = [];

      // And each file sequentially for every browser
      _.each(files, function(file, index) {
        var addToResults = function(data) {
          results.push(data);
          // If it is not the last file, we add a delay to make sure the previous
          // browser instance has some time to shut down gracefully
          return index === files.length - 1 ? results : Q.delay(delay);
        };

        browserRunner = browserRunner.then(function() {
            return self.testOne(file, browser);
          })
          // In both, error cases and success we want to
          // have it in the result list
          .then(addToResults, addToResults)
          .thenResolve(results);
      });
      return browserRunner;
    });

    // Normalizes the results from all the test runs
    // By turning them into a single array (including errors)
    Q.allSettled(runners).then(function(results) {
      var collectedResults = [];
      results.forEach(function(current) {
        if(current.value) {
          collectedResults.push.apply(collectedResults, current.value);
        }
      });
      return collectedResults;
    }).then(function(flattened) {
      if(_.some(flattened, function(result) {
        return result instanceof Error || result.failed > 0;
      })) {
        result.reject(flattened);
      } else {
        result.resolve(flattened);
      }
    });

    return result.promise;
  }
});

module.exports = Runner;
