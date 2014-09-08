var testee = require('../lib/testee');

module.exports = function (grunt) {
  grunt.registerMultiTask('testee', 'Run tests', function () {
    var done = this.async();
    var options = this.options();
    var files = this.filesSrc;
    var browsers = options.browsers || ['phantom'];

    testee.test(files, browsers, options).then(function() {
      done();
    }, function(errors) {
      grunt.fail(errors);
      done(errors);
    });
  });
};
