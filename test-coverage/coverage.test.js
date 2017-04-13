var assert = require('assert');
var path = require('path');
var del = require('del');
var fs = require('fs');
var testee = require('../lib/testee');

describe('Coverage', function() {
  var config = {
    root: path.join(__dirname, '..'),
    reporter: function () {
      // print nothing
    },
    coverage: {
      dir: 'test-coverage/coverage/',
      reporters: [ 'html' ],
      ignore: [ 'node_modules' ]
    }
  };
  var browser = process.env.TEST_BROWSER || 'firefox';
  var browsers = [ browser ];

  afterEach(function() {
    return del([ 'test-coverage/coverage' ]);
  });

  describe('QUnit example', function() {
    it('socketio', function() {
      return testee.test([ 'examples/qunit/index.html' ], browsers, config).fail(function(error) {
        assert.equal(error.message, 'There were 0 general errors and 1 total test failures.');
        assert.ok(fs.existsSync('test-coverage/coverage/qunit/blogpost.js.html'), 'reports coverage of blogpost.js');
        assert.ok(fs.existsSync('test-coverage/coverage/qunit/test.js.html'), 'reports coverage of qunit/test.js');
      });
    });

     it('rest', function() {
       return testee.test([ 'examples/qunit/rest.html' ], browsers, config).fail(function(error) {
         assert.equal(error.message, 'There were 0 general errors and 1 total test failures.');
         assert.ok(fs.existsSync('test-coverage/coverage/qunit/blogpost.js.html'), 'reports coverage of blogpost.js');
         assert.ok(fs.existsSync('test-coverage/coverage/qunit/test.js.html'), 'reports coverage of qunit/test.js');
       });
     });
  });

  describe('Jasmine example', function() {
    it('socketio', function() {
      return testee.test([ 'examples/jasmine/index.html' ], browsers, config).fail(function(error) {
        assert.equal(error.message, 'There were 0 general errors and 1 total test failures.');
        assert.ok(fs.existsSync('test-coverage/coverage/jasmine/blogpost.js.html'), 'reports coverage of blogpost.js');
        assert.ok(fs.existsSync('test-coverage/coverage/jasmine/test.js.html'), 'reports coverage of jasmine/test.js');
      });
    });

     it('rest', function() {
       return testee.test([ 'examples/jasmine/rest.html' ], browsers, config).fail(function(error) {
         assert.equal(error.message, 'There were 0 general errors and 1 total test failures.');
         assert.ok(fs.existsSync('test-coverage/coverage/jasmine/blogpost.js.html'), 'reports coverage of blogpost.js');
         assert.ok(fs.existsSync('test-coverage/coverage/jasmine/test.js.html'), 'reports coverage of jasmine/test.js');
       });
     });
  });

  describe('Mocha example', function() {
    it('socketio', function() {
      return testee.test([ 'examples/mocha/index.html' ], browsers, config).fail(function(error) {
        assert.equal(error.message, 'There were 0 general errors and 1 total test failures.');
        assert.ok(fs.existsSync('test-coverage/coverage/mocha/blogpost.js.html'), 'reports coverage of blogpost.js');
        assert.ok(fs.existsSync('test-coverage/coverage/mocha/test.js.html'), 'reports coverage of mocha/test.js');
      });
    });

     it('rest', function() {
       return testee.test([ 'examples/mocha/rest.html' ], browsers, config).fail(function(error) {
         assert.equal(error.message, 'There were 0 general errors and 1 total test failures.');
         assert.ok(fs.existsSync('test-coverage/coverage/mocha/blogpost.js.html'), 'reports coverage of blogpost.js');
         assert.ok(fs.existsSync('test-coverage/coverage/mocha/test.js.html'), 'reports coverage of mocha/test.js');
       });
     });
  });
});
