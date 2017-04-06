var assert = require('assert');
var path = require('path');
var del = require('del');
var fs = require('fs');
var testee = require('../lib/testee');

describe('Coverage', function() {
  var config = {
    root: path.join(__dirname, '..'),
    reporter: 'Dot',
    coverage: {
      dir: 'test/coverage/',
      reporters: [ 'html' ],
      ignore: [ 'node_modules' ]
    }
  };

  beforeEach(function() {
    return del([ 'test/coverage' ]);
  });
  
  describe('QUnit example', function() {
    it('socketio', function() {
      return testee.test([ 'examples/qunit/index.html' ], [ 'firefox' ], config).fail(function(error) {
        assert.equal(error.message, 'There were 0 general errors and 1 total test failures.');
        assert.ok(fs.existsSync('test/coverage/examples/blogpost.js.html'), 'reports coverage of blogpost.js');
        assert.ok(fs.existsSync('test/coverage/examples/qunit/test.js.html'), 'reports coverage of qunit/test.js');
      });
    });

    it('rest', function() {
      return testee.test([ 'examples/qunit/rest.html' ], [ 'firefox' ], config).fail(function(error) {
        assert.equal(error.message, 'There were 0 general errors and 1 total test failures.');
        assert.ok(fs.existsSync('test/coverage/examples/blogpost.js.html'), 'reports coverage of blogpost.js');
        assert.ok(fs.existsSync('test/coverage/examples/qunit/test.js.html'), 'reports coverage of qunit/test.js');
      });
    });
  });

  describe('Jasmine example', function() {
    it('socketio', function() {
      return testee.test([ 'examples/jasmine/index.html' ], [ 'firefox' ], config).fail(function(error) {
        assert.equal(error.message, 'There were 0 general errors and 1 total test failures.');
        assert.ok(fs.existsSync('test/coverage/examples/blogpost.js.html'), 'reports coverage of blogpost.js');
        assert.ok(fs.existsSync('test/coverage/examples/jasmine/test.js.html'), 'reports coverage of jasmine/test.js');
      });
    });

    it('rest', function() {
      return testee.test([ 'examples/jasmine/rest.html' ], [ 'firefox' ], config).fail(function(error) {
        assert.equal(error.message, 'There were 0 general errors and 1 total test failures.');
        assert.ok(fs.existsSync('test/coverage/examples/blogpost.js.html'), 'reports coverage of blogpost.js');
        assert.ok(fs.existsSync('test/coverage/examples/jasmine/test.js.html'), 'reports coverage of jasmine/test.js');
      });
    });
  });

  describe('Mocha example', function() {
    it('socketio', function() {
      return testee.test([ 'examples/mocha/index.html' ], [ 'firefox' ], config).fail(function(error) {
        assert.equal(error.message, 'There were 0 general errors and 1 total test failures.');
        assert.ok(fs.existsSync('test/coverage/examples/blogpost.js.html'), 'reports coverage of blogpost.js');
        assert.ok(fs.existsSync('test/coverage/examples/mocha/test.js.html'), 'reports coverage of mocha/test.js');
      });
    });

    it('rest', function() {
      return testee.test([ 'examples/mocha/rest.html' ], [ 'firefox' ], config).fail(function(error) {
        assert.equal(error.message, 'There were 0 general errors and 1 total test failures.');
        assert.ok(fs.existsSync('test/coverage/examples/blogpost.js.html'), 'reports coverage of blogpost.js');
        assert.ok(fs.existsSync('test/coverage/examples/mocha/test.js.html'), 'reports coverage of mocha/test.js');
      });
    });
  });
});
