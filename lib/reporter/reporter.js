var _ = require('lodash');
var mocha = require('mocha');
var EventEmitter = require('events').EventEmitter;
var BufferManager = require('./buffer/manager');

var testProperties = ['async', 'sync', 'timedOut', 'pending', 'file', 'duration'];

// Set up the converter with a Mocha reporter and services
module.exports = function(Reporter, services) {
  var runs = services.runs;
  var suites = services.suites;
  var tests = services.tests;

  // The event emitter used to emit the final events
  var runner = new EventEmitter();
  // A store (by data GUID) for the Mocha objects we created.
  var mochaObjects = {};
  // The handler for buffering simultaneous test runs
  var buffers = new BufferManager(runner);
  var updateCache = buffers.updateCache.bind(buffers);

  function startRun(data) {
    // When a new test run begins, start a root suite with the formatted environment
    // information as the title
    var suite = mochaObjects[data.id] = new mocha.Suite(data.environment, {});
    buffers.add(data.id).emit('suite', suite);
  }

  function updateRun(data) {
    var suite = mochaObjects[data.id];
    var buffer = buffers.get(data.id);

    if(!suite) {
      throw new Error('No started test run found for ' + JSON.stringify(data));
    }

    // Finish the root suite that we created for this test run
    if(data.status === 'finished') {
      buffer.emit('suite end', suite);
      buffer.emit('done', data);
    }
  }

  function startSuite(data) {
    var parent = mochaObjects[data.parent];

    if(!parent) {
      throw new Error('No parent suite found for ' + JSON.stringify(data));
    }

    // Create a new Mocha suite
    var suite = mocha.Suite.create(parent, data.title);

    parent.addSuite(suite);
    // Add the suite to the cache
    mochaObjects[data.id] = suite;

    buffers.get(data.id).emit('suite', suite);
  }

  function updateSuite(data) {
    var suite = mochaObjects[data.id];

    if(!suite) {
      throw new Error('No started suite found for ' + JSON.stringify(data));
    }

    // Finish the existing suite
    if(data.status === 'finished') {
      buffers.get(data.id).emit('suite end', suite);
    }
  }

  function startTest(data) {
    // Create a new Mocha test instance with out information
    var test = new mocha.Test(data.title, data.pending);
    var parent = mochaObjects[data.parent];

    if(!parent) {
      throw new Error('No parent suite found for test ' + JSON.stringify(data));
    }

    // Extend with the test properties that are interesting to us
    _.extend(test, _.pick(data, testProperties), {
      parent: parent
    });

    // Add to parent suite
    parent.addTest(test);

    mochaObjects[data.id] = test;
    // Emit the event that a test started
    buffers.get(data.id).emit('test', test);
  }

  function updateTest(data) {
    var test = mochaObjects[data.id];
    var buffer = buffers.get(data.id);

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

  new Reporter(runner);

  runs.on('created', updateCache);
  runs.on('patched', updateCache);

  runs.on('created', startRun);
  runs.on('patched', updateRun);

  suites.on('created', updateCache);
  suites.on('patched', updateCache);

  suites.on('created', startSuite);
  suites.on('patched', updateSuite);

  tests.on('created', updateCache);
  tests.on('patched', updateCache);

  tests.on('created', startTest);
  tests.on('patched', updateTest);
};
