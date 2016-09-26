var assert = require('assert');
var path = require('path');
var testee = require('../lib/testee');

describe.only('Testee', function() {
  var config = {
    reporter: 'Dot',
    root: path.join(__dirname, '..')
  };

  describe('QUnit example', function() {
    it('socketio provider', function(done) {
      testee.test([ 'examples/qunit/index.html' ], [ 'firefox' ], config).fail(function(error) {
        assert.equal(error.message, 'There were 0 general errors and 1 total test failures.');
        done();
      });
    });
    it('rest provider', function(done) {
      testee.test([ 'examples/qunit/rest.html' ], [ 'firefox' ], config).fail(function(error) {
        assert.equal(error.message, 'There were 0 general errors and 1 total test failures.');
        done();
      });
    });
  });

  describe('Jasmine example', function() {
    it('socketio provider', function(done) {
      testee.test([ 'examples/jasmine/index.html' ], [ 'firefox' ], config).fail(function(error) {
        assert.equal(error.message, 'There were 0 general errors and 1 total test failures.');
        done();
      });
    });
    it('rest provider', function(done) {
      testee.test([ 'examples/jasmine/rest.html' ], [ 'firefox' ], config).fail(function(error) {
        assert.equal(error.message, 'There were 0 general errors and 1 total test failures.');
        done();
      });
    });
  });

  describe('Mocha example', function() {
    it('socketio provider', function(done) {
      testee.test([ 'examples/mocha/index.html' ], [ 'firefox' ], config).fail(function() {
        done();
      });
    });
    it('rest provider', function(done) {
      testee.test([ 'examples/mocha/rest.html' ], [ 'firefox' ], config).fail(function() {
        done();
      });
    });
  });
});
