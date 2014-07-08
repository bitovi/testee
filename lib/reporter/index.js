var mocha = require('mocha');
var Converter = require('./converter');

module.exports = function(MochaReporter) {
  MochaReporter = (MochaReporter && typeof MochaReporter !== 'string') ?
    MochaReporter : mocha.reporters[MochaReporter || 'Spec'];

  return function() {
    Converter.create(this, MochaReporter);
  }
};
