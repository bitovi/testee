var assert = require('assert');
var path = require('path');
var testee = require('../lib/testee');

describe('Testee', function() {
  var oldLog;
  var config = {
    root: path.join(__dirname, '..', 'examples')
  };

  beforeEach(function() {
    oldLog = console.log;
    console.log = function() {};
  });

  afterEach(function() {
    console.log = oldLog;
  });

  it('QUnit example', function(done) {
    testee.test([ 'qunit/index.html' ], [ 'phantom' ], config).fail(function(error) {
      assert.equal(error.message, 'There were 0 general errors and 1 total test failures.');
      done();
    });
  });

  it('Jasmine example', function(done) {
    testee.test([ 'jasmine/index.html' ], [ 'phantom' ], config).fail(function(error) {
      assert.equal(error.message, 'There were 0 general errors and 1 total test failures.');
      done();
    });
  });

  it('Mocha example', function(done) {
    testee.test([ 'mocha/index.html' ], [ 'phantom' ], config).fail(function() {
      done();
    });
  });
});
