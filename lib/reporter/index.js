var _ = require('lodash');
var mocha = require('mocha');
var EventEmitter = require('events').EventEmitter;
var BufferManager = require('./buffer/manager');
var testProperties = ['async', 'sync', 'timedOut', 'pending', 'file', 'duration'];

function Reporter(MochaReporter) {
  MochaReporter = typeof MochaReporter !== 'string' ? MochaReporter : mocha.reporters[MochaReporter];

  if(!MochaReporter) {
    MochaReporter = mocha.reporters['Spec'];
    // TODO add an error
  }

  // The event emitter used to emit the final events
  var runner = this.runner = new EventEmitter();
  // A store (by data GUID) for the Mocha objects we created.
  // The handler for buffering simultaneous test runs
  this.buffers = new BufferManager(runner);
  // The actual (suite and test) objects we can feed to the Mocha runner
  this._mochaObjects = {};
  // The instantiated Mocha reporter
  this.reporter = new MochaReporter(runner);
}

_.extend(Reporter.prototype, {
  // Called when the Feathers application is set up with the event
  // services for runs, suites and tests (which are event emitters)
  setup: function(runs, suites, tests) {
    // Update the event buffer cache (so that it can lookup the root test run)
    var updateCache = this.buffers.updateCache.bind(this.buffers);

    runs.on('created', updateCache);
    runs.on('patched', updateCache);

    runs.on('created', this.proxy('startRun'));
    runs.on('patched', this.proxy('updateRun'));

    suites.on('created', updateCache);
    suites.on('patched', updateCache);

    suites.on('created', this.proxy('startSuite'));
    suites.on('patched', this.proxy('updateSuite'));

    tests.on('created', updateCache);
    tests.on('patched', updateCache);

    tests.on('created', this.proxy('startTest'));
    tests.on('patched', this.proxy('updateTest'));

    this.start();
  },

  proxy: function(name) {
    return this[name].bind(this);
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
    // TODO pass environment and format it a little more nicely
    var suite = this._mochaObjects[data.id] = new mocha.Suite(data.environment, {});
    this.buffers.add(data.id).emit('suite', suite);
  },

  updateRun: function(data) {
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
    // Create a new Mocha test instance with out information
    var test = new mocha.Test(data.title, data.pending);
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
  },

  updateTest: function(data) {
    var test = this._mochaObjects[data.id];
    var buffer = this.buffers.get(data.id);

    if(!test) {
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
  }
});

module.exports = Reporter;
