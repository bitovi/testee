var _ = require('lodash');
var mocha = require('mocha');
var url = require('url');
var EventEmitter = require('events').EventEmitter;
var useragent = require('useragent');
var istanbul = require('istanbul');
var debug = require('debug')('testee:reporter');

var utils = require('../utils');
var BufferManager = require('./buffer/manager');
var testProperties = ['async', 'sync', 'timedOut', 'pending', 'file', 'duration'];

// The reporter listens to service events and reports it to the command line using
// any of the Mocha reporters.
function Reporter(MochaReporter, coverage) {
  MochaReporter = typeof MochaReporter !== 'string' ? MochaReporter : mocha.reporters[MochaReporter];

  // The event emitter used to emit the final events
  var runner = this.runner = new EventEmitter();
  // A store (by data GUID) for the Mocha objects we created.
  // The handler for buffering simultaneous test runs
  this.buffers = new BufferManager(runner);
  // The actual (suite and test) objects we can feed to the Mocha runner
  this._mochaObjects = {};
  // The instantiated Mocha reporter
  this.reporter = new MochaReporter(runner);
  // This is where we store errors so that we can report them all
  // at once at the end
  this.errors = [];
  // Options for reporting code coverage
  this.coverage = coverage;
}

_.extend(Reporter.prototype, {
  // Called when the Feathers application is set up with the event
  // services for runs, suites and tests (which are event emitters)
  setup: function(runs, suites, tests, coverages) {
    debug('setting up Mocha command line reporter');

    runs.on('error', this.proxy('error'));

    runs.on('created', this.proxy('startRun'));
    runs.on('patched', this.proxy('updateRun'));

    suites.on('created', this.proxy('startSuite'));
    suites.on('patched', this.proxy('updateSuite'));

    tests.on('created', this.proxy('startTest'));
    tests.on('patched', this.proxy('updateTest'));

    coverages.on('created', this.proxy('reportCoverage'));

    this.start();
  },

  proxy: function(name) {
    return this[name].bind(this);
  },

  start: function() {
    debug('start');
    this.runner.emit('start', {});
  },

  end: function() {
    debug('end');
    this.reportErrors();
    this.runner.emit('end', {});
  },

  error: function(error) {
    debug('adding error to reporter', error);
    this.errors.push(error);
  },

  reportErrors: function() {
    debug('reportErrors', this.errors.length);
    if(!this.errors.length) {
      return;
    }

    var id = utils.guid();
    var run = {
      id: id,
      title: 'General error'
    };

    this.startRun(run);
    this.errors.forEach(function(error) {
      debug('reporting error', error);
      var test = {
        id: utils.guid(),
        parent: id,
        status: 'failed',
        err: error,
        title: error.title || error.message
      };

      this.startTest(test);
      this.updateTest(test);
    }.bind(this));

    this.updateRun(_.extend({
      status: 'finished'
    }, run));
  },

  startRun: function(data) {
    debug('starting run', data);
    this.buffers.updateCache(data);

    var suiteTitle = data.title;

    if(data.environment) {
      // When a new test run begins, start a root suite with the formatted environment
      // information as the title
      var agent = useragent.parse(data.environment);
      var file = url.parse(data.file);

      suiteTitle = data.runner + ' "' + file.pathname.substring(1) + '" on ' + agent.toString() + ':';
    }

    var suite = this._mochaObjects[data.id] = new mocha.Suite(suiteTitle, {});
    this.buffers.add(data.id).emit('suite', suite);
  },

  updateRun: function(data) {
    debug('updating run', data);
    this.buffers.updateCache(data);

    var suite = this._mochaObjects[data.id];
    var buffer = this.buffers.get(data.id);

    if(!suite) {
      throw new Error('No started test run found for ' + JSON.stringify(data));
    }

    // Finish the root suite that we created for this test run
    if(data.status === 'finished') {
      buffer.emit('suite end', suite);
      buffer.emit('done', data);
    }
  },

  startSuite: function(data) {
    debug('starting suite', data);
    this.buffers.updateCache(data);

    var parent = this._mochaObjects[data.parent];

    if(!parent) {
      throw new Error('No parent suite found for ' + JSON.stringify(data));
    }

    // Create a new Mocha suite
    var suite = mocha.Suite.create(parent, data.title);

    parent.addSuite(suite);
    // Add the suite to the cache
    this._mochaObjects[data.id] = suite;

    this.buffers.get(data.id).emit('suite', suite);
  },

  updateSuite: function(data) {
    debug('updating suite', data);
    this.buffers.updateCache(data);

    var suite = this._mochaObjects[data.id];

    if(!suite) {
      throw new Error('No started suite found for ' + JSON.stringify(data));
    }

    // Finish the existing suite
    if(data.status === 'finished') {
      this.buffers.get(data.id).emit('suite end', suite);
    }
  },

  startTest: function(data) {
    debug('starting test', data);
    this.buffers.updateCache(data);

    // Create a new Mocha test instance with out information
    var test = new mocha.Test(data.title, true);
    var parent = this._mochaObjects[data.parent];

    if(!parent) {
      throw new Error('No parent suite found for test ' + JSON.stringify(data));
    }

    // Extend with the test properties that are interesting to us
    _.extend(test, _.pick(data, testProperties), {
      parent: parent
    });

    // Add to parent suite
    parent.addTest(test);

    this._mochaObjects[data.id] = test;
    // Emit the event that a test started
    this.buffers.get(data.id).emit('test', test);

    if(data.pending) {
      this.updateTest(data);
    }
  },

  updateTest: function(data) {
    debug('updating test', data);
    this.buffers.updateCache(data);

    var test = this._mochaObjects[data.id];
    var buffer = this.buffers.get(data.id);

    if(!test || !buffer) {
      throw new Error('No test information found for ' + JSON.stringify(data));
    }

    // Update the existing test with the new properties we got
    _.extend(test, _.pick(data, testProperties));

    // Emit the events on the runner appropriate for the test result
    switch(data.status) {
      case 'failed':
        // The second argument is the error which can be passed right through
        buffer.emit('fail', test, data.err);
        break;
      case 'pending':
        buffer.emit('pending', test);
        break;
      default:
        buffer.emit('pass', test);
    }

    // Emit the test end event right away
    buffer.emit('test end', test);
  },

  reportCoverage: function(data) {
    debug('reporting code coverage', data);
    var options = this.coverage;
    var reporter = new istanbul.Reporter(false, options.dir);
    var collector = new istanbul.Collector();
    var formats = options.reporters ? _.toArray(options.reporters) : ['text'];

    // If we are reporting text to the command line we need to add a newline
    if(formats.indexOf('text') !== -1) {
      console.log('\n');
    }

    collector.add(data.coverage);
    reporter.addAll(formats);
    reporter.write(collector, true, _.noop);
  }
});

module.exports = Reporter;
