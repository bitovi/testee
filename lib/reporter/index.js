// var reporters = require('mocha').reporters;
// var EventEmitter = require('events').EventEmitter;

module.exports = function() {
  return function() {
    var app = this;

    app.lookup('/runs').on('created', function(data) {
      console.log('\n' + data.runner + ' test started on ' + data.environment);
    });

    app.lookup('/suites').on('created', function(suite) {
      console.log(suite.title);
    });

    app.lookup('/tests').on('created', function(test) {
      console.log('> ' + test.title);
    });
  }
};
