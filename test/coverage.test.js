var assert = require('assert');
var path = require('path');
var del = require('del');
var fs = require('fs');
var async = require('async');
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
  
  describe('QUnit example', function() {
    it('socketio', function(done) {
      del([ 'test/coverage' ]).then(function () {
        testee.test([ 'examples/qunit/index.html' ], [ 'firefox' ], config).fail(function(error) {
          assert.equal(error.message, 'There were 0 general errors and 1 total test failures.');

          async.map([ 'test/coverage/__root__', 'test/coverage/qunit' ], fs.readdir, function (err, files) {
              assert.ok(files[0].indexOf('blogpost.js.html') >= 0, 'reports coverage of blogpost.js');
              assert.ok(files[1].indexOf('test.js.html') >= 0, 'reports coverage of qunit/test.js');
              done();
          });
        });
      });
    });
    it('rest', function(done) {
      del([ 'test/coverage' ]).then(function () {
        testee.test([ 'examples/qunit/rest.html' ], [ 'firefox' ], config).fail(function(error) {
          assert.equal(error.message, 'There were 0 general errors and 1 total test failures.');

          async.map([ 'test/coverage/__root__', 'test/coverage/qunit' ], fs.readdir, function (err, files) {
              assert.ok(files[0].indexOf('blogpost.js.html') >= 0, 'reports coverage of blogpost.js');
              assert.ok(files[1].indexOf('test.js.html') >= 0, 'reports coverage of qunit/test.js');
              done();
          });
        });
      });
    });
  });

  describe('Jasmine example', function() {
    it('socketio', function(done) {
      del([ 'test/coverage' ]).then(function () {
        testee.test([ 'examples/jasmine/index.html' ], [ 'firefox' ], config).fail(function(error) {
          assert.equal(error.message, 'There were 0 general errors and 1 total test failures.');

          async.map([ 'test/coverage/__root__', 'test/coverage/jasmine' ], fs.readdir, function (err, files) {
            assert.ok(files[0].indexOf('blogpost.js.html') >= 0, 'reports coverage of blogpost.js');
            assert.ok(files[1].indexOf('test.js.html') >= 0, 'reports coverage of jasmine/test.js');
            done();
          });
        });
      });
    });
    it('rest', function(done) {
      del([ 'test/coverage' ]).then(function () {
        testee.test([ 'examples/jasmine/rest.html' ], [ 'firefox' ], config).fail(function(error) {
          assert.equal(error.message, 'There were 0 general errors and 1 total test failures.');

          async.map([ 'test/coverage/__root__', 'test/coverage/jasmine' ], fs.readdir, function (err, files) {
            assert.ok(files[0].indexOf('blogpost.js.html') >= 0, 'reports coverage of blogpost.js');
            assert.ok(files[1].indexOf('test.js.html') >= 0, 'reports coverage of jasmine/test.js');
            done();
          });
        });
      });
    });
  });

  describe('Mocha example', function() {
    it('socketio', function(done) {
      del([ 'test/coverage' ]).then(function () {
        testee.test([ 'examples/mocha/index.html' ], [ 'firefox' ], config).fail(function() {
          async.map([ 'test/coverage/__root__', 'test/coverage/mocha' ], fs.readdir, function (err, files) {
            assert.ok(files[0].indexOf('blogpost.js.html') >= 0, 'reports coverage of blogpost.js');
            assert.ok(files[1].indexOf('test.js.html') >= 0, 'reports coverage of mocha/test.js');
            done();
          });
        });
      });
    });
    it('rest', function(done) {
      del([ 'test/coverage' ]).then(function () {
        testee.test([ 'examples/mocha/rest.html' ], [ 'firefox' ], config).fail(function() {
          async.map([ 'test/coverage/__root__', 'test/coverage/mocha' ], fs.readdir, function (err, files) {
            assert.ok(files[0].indexOf('blogpost.js.html') >= 0, 'reports coverage of blogpost.js');
            assert.ok(files[1].indexOf('test.js.html') >= 0, 'reports coverage of mocha/test.js');
            done();
          });
        });
      });
    });
  });
});
