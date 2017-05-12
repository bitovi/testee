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

  describe('QUnit example', function () {
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

  describe('Jasmine example', function () {
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

  describe('Mocha example', function () {
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
});
