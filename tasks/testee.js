var testee = require('../lib/testee');

module.exports = function (grunt) {
  grunt.registerMultiTask('testee', 'Run tests', function () {
    var done = this.async();
    var options = this.options();
    var browsers = options.browsers || ['phantom'];
    var files = grunt.file.expand(grunt.util._.flatten(this.files.map(function(file) {
      return file.orig.src;
    })));

    testee.test(files, browsers, options).then(function() {
      done();
    }, function(error) {
      done(error);
    });
  });
};
