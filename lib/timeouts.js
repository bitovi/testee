var debug = require('debug')('testee:timeouts');

module.exports = function(options) {
  if(!options || typeof options.timeout !== 'number') {
    throw new Error('A timeout needs to be provided');
  }

  var timeout = 1000; // options.timeout * 1000;

  return function() {
    var app = this;
    var runs = app.service('runs');
    var suites = app.service('suites');
    var tests = app.service('tests');
    var state = {
      cache: {},
      timeouts: {},
      setTimeout: function(id, callback) {
        debug('Setting timeout for run, suite or test', id, timeout);
        this.timeouts[id] = setTimeout(function() {
          debug('Calling timeout function for', id);
          delete this.timeouts[id];
          callback();
        }, timeout);
      },

      clearTimeout: function(id) {
        debug('Clearing timeout for', id);
        clearTimeout(this.timeouts[id]);
        delete this.timeouts[id];
      }
    };

    runs.on('created', function(run) {
      state.setTimeout(run.id, function() {

      });
    });

    suites.on('created', function(suite) {
      state.clearTimeout(suite.parent);
      state.setTimeout(suite.id, function() {

      });
    }).on('patched', function(suite) {
      state.clearTimeout(suite.id);
    });

    app.service('tests').on('created', function(test) {
      state.clearTimeout(test.parent);

      // console.log(test);

      if(!test.status || test.status !== 'pending') {
        state.setTimeout(test.id, function() {
          var message = 'Test timed out after ' + timeout + 'ms';
          console.log('Running timeout handler', test);
          tests.patch(test.id, {
            status: 'failed',
            err: {
              message: message,
              stack: message
            }
          });
        });
      }
    }).on('patched', function(test) {
      console.log('Test patched', test);
      state.clearTimeout(test.id);
    });
  };
};
