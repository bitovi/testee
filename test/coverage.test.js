var assert = require('assert');
var path = require('path');
var del = require('del');
var fs = require('fs');
var async = require('async');
var testee = require('../lib/testee');

describe('Coverage', function() {
  var config = {
    root: path.join(__dirname, '..', 'examples'),
    reporter: 'Dot',
    coverage: {
      dir: 'test/coverage/',
      reporters: [ 'html' ],
      ignore: [
        "bower_components"
      ]
    }
  };
  
  it('QUnit example', function(done) {
    del([ 'test/coverage' ]).then(function () {
      testee.test([ 'qunit/index.html' ], [ 'firefox' ], config).fail(function(error) {
        assert.equal(error.message, 'There were 0 general errors and 1 total test failures.');

        async.map([ 'test/coverage/__root__', 'test/coverage/qunit' ], fs.readdir, function (err, files) {
            assert.ok(files[0].indexOf('blogpost.js.html') >= 0, 'reports coverage of blogpost.js');
            assert.ok(files[1].indexOf('test.js.html') >= 0, 'reports coverage of qunit/test.js');
            done();
        });
      });
    });
  });

  it('Jasmine example', function(done) {
    del([ 'test/coverage' ]).then(function () {
      testee.test([ 'jasmine/index.html' ], [ 'firefox' ], config).fail(function(error) {
        assert.equal(error.message, 'There were 0 general errors and 1 total test failures.');

        async.map([ 'test/coverage/__root__', 'test/coverage/jasmine' ], fs.readdir, function (err, files) {
          assert.ok(files[0].indexOf('blogpost.js.html') >= 0, 'reports coverage of blogpost.js');
          assert.ok(files[1].indexOf('test.js.html') >= 0, 'reports coverage of jasmine/test.js');
          done();
        });
      });
    });
  });

  it('Mocha example', function(done) {
    del([ 'test/coverage' ]).then(function () {
      testee.test([ 'mocha/index.html' ], [ 'firefox' ], config).fail(function() {
        async.map([ 'test/coverage/__root__', 'test/coverage/mocha' ], fs.readdir, function (err, files) {
          assert.ok(files[0].indexOf('blogpost.js.html') >= 0, 'reports coverage of blogpost.js');
          assert.ok(files[1].indexOf('test.js.html') >= 0, 'reports coverage of mocha/test.js');
          done();
        });
      });
    });
  });
});
