var assert = require('assert');
var path = require('path');
var testee = require('../lib/testee');

describe('Testee', function () {
  var config = {
    root: path.join(__dirname, '..'),
    reporter: function () {
      // print nothing
    }
  };
  var browser = process.env.TEST_BROWSER || 'firefox';
  var browsers = [browser];

  it('should fail fast if tests files are not found', function (done) {
    var filename = 'zzz/not-a-file.html';
    testee.test([filename], browsers, config).catch(function (error) {
      assert.equal(error.message, 'File "' + filename + '" not found');
      done();
    });
  });

  describe.skip('QUnit example', function () {
    it('socketio provider', function (done) {
      testee.test(['examples/qunit/index.html'], browsers, config).catch(function (error) {
        assert.equal(error.message, 'There were 0 general errors and 1 total test failures.');
        done();
      });
    });
    it('rest provider', function (done) {
      testee.test(['examples/qunit/rest.html'], browsers, config).catch(function (error) {
        assert.equal(error.message, 'There were 0 general errors and 1 total test failures.');
        done();
      });
    });
  });

  describe.skip('Jasmine example', function () {
    it('socketio provider', function (done) {
      testee.test(['examples/jasmine/index.html'], browsers, config).catch(function (error) {
        assert.equal(error.message, 'There were 0 general errors and 1 total test failures.');
        done();
      });
    });
    it('rest provider', function (done) {
      testee.test(['examples/jasmine/rest.html'], browsers, config).catch(function (error) {
        assert.equal(error.message, 'There were 0 general errors and 1 total test failures.');
        done();
      });
    });
  });

  describe.skip('Mocha example', function () {
    it('socketio provider', function (done) {
      testee.test(['examples/mocha/index.html'], browsers, config).catch(function () {
        done();
      });
    });
    it('rest provider', function (done) {
      testee.test(['examples/mocha/rest.html'], browsers, config).catch(function () {
        done();
      });
    });
  });

  describe('with all browsers', function () {
    it('QUnit example: socketio provider', function (done) {
      testee.test(['examples/qunit/index.html'], ['*'], config).catch(function (error) {
        // the number in the error will match the number of browsers in the system.
        assert.equal(/^There were 0 general errors and [0-9]+ total test failures\.$/.test(error.message), true);
        done();
      });
    });
  });


});
