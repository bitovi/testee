var _ = require('lodash');
var debug = require('debug')('testee:runner');
var utils = require('./utils');

function Runner(options) {
  this.configuration = options;
}

_.extend(Runner.prototype, {
  testOne: function (file, browser) {
    browser = typeof browser === 'string' ? { browser: browser } : browser;

    var timeoutSeconds = this.configuration.timeout;
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
    var trackTestRun = function () {
      debug('tracking test run', url, browser);
      return new Promise(function (resolve, reject) {
        var checkToken = new RegExp(token);
        var isTokenSigned = function (file) {
          return checkToken.test(file);
        };
        // The emitted data.file property contains the token we added to the browser URL
        var checkIfRunIsFinished = function (data) {
          var isSigned = isTokenSigned(data.file);
          var isFinished = data.status === 'finished';
          var isComplete = isSigned && isFinished;
          debug('checking if run', url, 'is finished', isComplete);
          if (isComplete) {
            testRuns.removeListener('patched', checkIfRunIsFinished);
            resolve(data);
          }
        };
        var testTimedOut = function () {
          debug('test', url, 'timed out');
          testRuns.removeListener('patched', checkIfRunIsFinished);
          testRuns.removeListener('created', checkIfRunIsSigned);

          var baseError = new Error('Browser timed out within ' + timeout + ' seconds');
          var testError = new utils.TesteeError(baseError, errorTitle);
          reject(testError);
        };
        // Sets the test run timeout
        var timeout = setTimeout(testTimedOut, timeoutSeconds * 1000);
        var checkIfRunIsSigned = function (data) {
          // When a test run with our token has been created we can clear the timeout
          var isSigned = isTokenSigned(data.file);
          debug('checking if browser timeout can be reset', url, isSigned);
          if (isSigned) {
            testRuns.removeListener('created', checkIfRunIsSigned);
            clearTimeout(timeout);
          }
        };

        testRuns.on('patched', checkIfRunIsFinished);
        testRuns.on('created', checkIfRunIsSigned);
      });
    };

    debug('running individual test', url, browser);
    var launcher = this.configuration.launcher;
    return new Promise(function createBrowser(resolve, reject) {
      launcher(url, browser, function (error, instance) {
        if (error) {
          return reject(error);
        }
        resolve(instance);
      });
    }).then(function (instance) {
      debug('browser instance started', browser);
      var debugData = function (data) {
        debug(data.toString(), url, browser);
      };

      if (instance.stdout) {
        instance.stdout.on('data', debugData);
      }

      if (instance.stderr) {
        instance.stderr.on('data', debugData);
      }

      var stopBrowser = function () {
        debug('stopping browser instance', browser);
        return new Promise(function (resolve, reject) {
          instance.stop(function (error) {
            if (error) {
              return reject(error);
            }
            resolve(error);
          });
        });
      };

      // TODO: Fix when native promises support finally
      return trackTestRun().then(function (result) {
        return stopBrowser().then(function () {
          return result;
        });
      }, function (error) {
        return stopBrowser().then(function () {
          throw error;
        });
      });
    }).catch(function (error) {
      throw new utils.TesteeError(error, errorTitle);
    });
  },

  test: function (files, browsers) {
    debug('running tests for', files, browsers);
    files = typeof files === 'string' ? [files] : files;
    browsers = typeof browsers === 'string' ? [browsers] : browsers;

    var self = this;
    var shutDownDelay = this.configuration.delay;
    // Runs each browser in parallel
    // Runs each browser's test files in series
    var runners = _.toArray(browsers).map(function (browser) {
      debug('initializing sequential test runs for browser', browser);
      return files.reduce(function (promise, file, index) {
        return promise.then(function (results) {
          return self.testOne(file, browser)
            .catch(function (error) {
              // Test errors should be in results
              return error;
            })
            .then(function (result) {
              return results.concat(result);
            })
            .then(function (results) {
              // If it is not the last file, we add a delay to make sure the previous
              // browser instance has some time to shut down gracefully
              var isLast = index === files.length - 1;
              if (isLast) {
                return results;
              }
              return delay(shutDownDelay).then(function () {
                return results;
              });
            });
        });
      }, Promise.resolve([]));
    });

    return Promise.all(runners).then(function (resultLists) {
      var results = flatten(resultLists);
      var hasError = _.some(results, function (result) {
        return result instanceof Error || result.failed > 0;
      });
      if (hasError) {
        return Promise.reject(results);
      }
      return results;
    });
  }
});

function delay(milliseconds) {
  return new Promise(function (resolve) {
    setTimeout(resolve, milliseconds);
  });
}

function flatten(list) {
  return list.reduce(function (allItems, listItems) {
    return allItems.concat(listItems);
  }, []);
}

module.exports = Runner;
