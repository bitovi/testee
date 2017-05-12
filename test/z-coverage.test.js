/*
  NOTE: Do not rename this file.

  This file's name is intentionally prefixed with a z
  in order for Mocha to run these tests last. This itself
  is a test of lib/server's `nocache` middleware.

  This test "passes" if the folowing coverage tests pass.
  This is because the tests that run before these would
    otherwise be cached in the browser, making the
    subsequent requests for the instrumented files to
    never be made.

  TODO: design a way to test this functionality better.
*/

var assert = require('assert');
var path = require('path');
var del = require('del');
var fs = require('fs');
var testee = require('../lib/testee');

var fixture = path.join(__dirname, 'coverage');

describe('Coverage', function () {
  var config = {
    root: path.join(__dirname, '..'),
    reporter: function () {
      // print nothing
    },
    coverage: {
      dir: 'test/coverage/',
      reporters: ['html'],
      ignore: ['node_modules']
    }
  };
  var browser = process.env.TEST_BROWSER || 'firefox';
  var browsers = [browser];

  beforeEach(function () {
    return del([fixture]).then(function () {
      return new global.Promise(function (resolve, reject) {
        fs.mkdir(fixture, function (error) {
          if (error) {
            return reject(error);
          }
          resolve();
        });
      });
    });
  });

  after(function () {
    return del([fixture]);
  });

  describe('QUnit example', function () {
    it('socketio', function () {
      return testee.test(['examples/qunit/index.html'], browsers, config).catch(function (error) {
        assert.equal(error.message, 'There were 0 general errors and 1 total test failures.');
        assert.ok(fs.existsSync('test/coverage/qunit/blogpost.js.html'), 'reports coverage of blogpost.js');
        assert.ok(fs.existsSync('test/coverage/qunit/test.js.html'), 'reports coverage of qunit/test.js');
      });
    });

    it('rest', function () {
      return testee.test(['examples/qunit/rest.html'], browsers, config).catch(function (error) {
        assert.equal(error.message, 'There were 0 general errors and 1 total test failures.');
        assert.ok(fs.existsSync('test/coverage/qunit/blogpost.js.html'), 'reports coverage of blogpost.js');
        assert.ok(fs.existsSync('test/coverage/qunit/test.js.html'), 'reports coverage of qunit/test.js');
      });
    });
  });

  describe('Jasmine example', function () {
    it('socketio', function () {
      return testee.test(['examples/jasmine/index.html'], browsers, config).catch(function (error) {
        assert.equal(error.message, 'There were 0 general errors and 1 total test failures.');
        assert.ok(fs.existsSync('test/coverage/jasmine/blogpost.js.html'), 'reports coverage of blogpost.js');
        assert.ok(fs.existsSync('test/coverage/jasmine/test.js.html'), 'reports coverage of jasmine/test.js');
      });
    });

    it('rest', function () {
      return testee.test(['examples/jasmine/rest.html'], browsers, config).catch(function (error) {
        assert.equal(error.message, 'There were 0 general errors and 1 total test failures.');
        assert.ok(fs.existsSync('test/coverage/jasmine/blogpost.js.html'), 'reports coverage of blogpost.js');
        assert.ok(fs.existsSync('test/coverage/jasmine/test.js.html'), 'reports coverage of jasmine/test.js');
      });
    });
  });

  describe('Mocha example', function () {
    it('socketio', function () {
      return testee.test(['examples/mocha/index.html'], browsers, config).catch(function (error) {
        assert.equal(error.message, 'There were 0 general errors and 1 total test failures.');
        assert.ok(fs.existsSync('test/coverage/mocha/blogpost.js.html'), 'reports coverage of blogpost.js');
        assert.ok(fs.existsSync('test/coverage/mocha/test.js.html'), 'reports coverage of mocha/test.js');
      });
    });

    it('rest', function () {
      return testee.test(['examples/mocha/rest.html'], browsers, config).catch(function (error) {
        assert.equal(error.message, 'There were 0 general errors and 1 total test failures.');
        assert.ok(fs.existsSync('test/coverage/mocha/blogpost.js.html'), 'reports coverage of blogpost.js');
        assert.ok(fs.existsSync('test/coverage/mocha/test.js.html'), 'reports coverage of mocha/test.js');
      });
    });
  });
});
