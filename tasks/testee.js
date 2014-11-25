var path = require('path');
var testee = require('../lib/testee');

module.exports = function (grunt) {
  grunt.registerMultiTask('testee', 'Run tests', function () {
    var done = this.async();
    var options = this.options();
    var browsers = options.browsers || ['phantom'];
    var files = grunt.file.expand(grunt.util._.flatten(this.files.map(function (file) {
      // Test file path need to be absolute to the root so that grunt.file.expand can glob them
      return file.orig.src;
    })).map(function(filename) {
      return path.join(options.root || '', filename);
    }));

    if(options.root) {
      // Each file in the globbed list needs to be converted back to their relative paths
      files = files.map(function (file) {
        return path.relative(options.root || '', file);
      });
    }

    if(!files.length) {
      return done(new Error('No file passed to Testee task.'));
    }

    testee.test(files, browsers, options).then(function () {
      done();
    }, function (error) {
      done(error);
    });
  });
};
