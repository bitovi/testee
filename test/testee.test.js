var assert = require('assert');
var path = require('path');
var testee = require('../lib/testee');

describe('Testee', function() {
  var config = {
    reporter: 'Dot',
    root: path.join(__dirname, '..', 'examples')
  };

  it('QUnit example', function(done) {
    testee.test([ 'qunit/index.html' ], [ 'firefox' ], config).fail(function(error) {
      assert.equal(error.message, 'There were 0 general errors and 1 total test failures.');
      done();
    });
  });

  it('Jasmine example', function(done) {
    testee.test([ 'jasmine/index.html' ], [ 'firefox' ], config).fail(function(error) {
      assert.equal(error.message, 'There were 0 general errors and 1 total test failures.');
      done();
    });
  });

  it('Mocha example', function(done) {
    testee.test([ 'mocha/index.html' ], [ 'firefox' ], config).fail(function() {
      done();
    });
  });
});
