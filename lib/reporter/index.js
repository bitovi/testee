var _ = require('lodash');
var mocha = require('mocha');
var setupReporter = require('./reporter');

module.exports = function(Reporter) {
  Reporter = (Reporter && typeof Reporter !== 'string') ?
    Reporter : mocha.reporters[Reporter || 'Spec'];

  return function() {
    var app = this;
    // Grab the relevant services
    setupReporter(Reporter, {
      runs: app.lookup('/runs'),
      suites: app.lookup('/suites'),
      tests: app.lookup('/tests')
    });
  }
};
