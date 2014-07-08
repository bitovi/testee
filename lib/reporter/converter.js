var Proto = require('uberproto');
var mocha = require('mocha');
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');

var testProperties = ['async', 'sync', 'timedOut', 'pending', 'file', 'duration'];

module.exports = Proto.extend({
  init: function(app, MochaReporter) {
    var runs = app.lookup('/runs');
    var suites = app.lookup('/suites');
    var tests = app.lookup('/tests');

    this.cache = {};
    this.runner = new EventEmitter();
    this.reporter = new MochaReporter(this.runner);

    runs.on('created', this.proxy('startRun'));
    runs.on('patched', this.proxy('endRun'));

    suites.on('created', this.proxy('startSuite'));
    suites.on('patched', this.proxy('updateSuite'));

    tests.on('created', this.proxy('startTest'));
    tests.on('patched', this.proxy('updateTest'));
  },

  start: function() {
    this.runner.emit('start', {});
  },

  end: function() {
    this.runner.emit('end', {});
  },

  startRun: function(data) {
    // When a new test run begins, start a root suite with the formatted environment
    // information as the title
    var suite = this.cache[data.id] = new mocha.Suite(data.environment, {});
    this.runner.emit('suite', suite);
  },

  endRun: function(data) {
    var suite = this.cache[data.id];

    if(!suite) {
      throw new Error('No started test run found for ' + JSON.stringify(data));
    }

    if(data.status === 'finished') {
      this.runner.emit('suite end', suite);
    }
  },

  startSuite: function(data) {
    var parent = this.cache[data.parent];

    if(!parent) {
      throw new Error('No parent suite found for ' + JSON.stringify(data));
    }

    var suite = mocha.Suite.create(parent, data.title);

    parent.addSuite(suite);

    this.runner.emit('suite', suite);
    this.cache[data.id] = suite;
  },

  updateSuite: function(data) {
    var suite = this.cache[data.id];

    if(!suite) {
      throw new Error('No started suite found for ' + JSON.stringify(data));
    }

    if(data.status === 'finished') {
      this.runner.emit('suite end', suite);
    }
  },

  startTest: function(data) {
    var test = new mocha.Test(data.title, data.pending);
    var parent = this.cache[data.parent];

    if(!parent) {
      throw new Error('No parent suite found for test ' + JSON.stringify(data));
    }

    _.extend(test, _.pick(data, testProperties), {
      parent: parent
    });

    parent.addTest(test);

    this.cache[data.id] = test;
    this.runner.emit('test', test);
  },

  updateTest: function(data) {
    var test = this.cache[data.id];

    if(!test) {
      throw new Error('No test information found for ' + JSON.stringify(data));
    }

    var runner = this.runner;

    _.extend(test, _.pick(data, testProperties));

    switch(data.status) {
      case 'failed':
        runner.emit('fail', test, data.err);
        break;
      case 'pending':
        runner.emit('pending', test);
        break;
      default:
        runner.emit('pass', test);
    }

    runner.emit('test end', test);
  }
});
