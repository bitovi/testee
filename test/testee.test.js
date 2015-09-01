var assert = require('assert');
var path = require('path');
var _ = require('lodash');

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
    testee.test([ 'qunit/index.html' ], [ 'firefox' ], _.extend(config, {
      port: 3997
    })).fail(function(error) {
      assert.equal(error.message, 'There were 0 general errors and 1 total test failures.');
      done();
    });
  });

  it('Jasmine example', function(done) {
    testee.test([ 'jasmine/index.html' ], [ 'firefox' ], _.extend(config, {
      port: 3998
    })).fail(function(error) {
      assert.equal(error.message, 'There were 0 general errors and 1 total test failures.');
      done();
    });
  });

  it('Mocha example', function(done) {
    testee.test([ 'mocha/index.html' ], [ 'firefox' ], _.extend(config, {
      port: 3999
    })).fail(function() {
      done();
    });
  });
});
