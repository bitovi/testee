var testee = require('../lib/testee');

module.exports = function(grunt) {
	grunt.registerMultiTask('testee', 'Run tests', function() {
		var configuration = grunt.config(['testee', this.target]);
		var files = grunt.file.expand(this.file.src);
		var done = this.async();
		testee.test(files, configuration, function (error, stats) {
			if(error) {
				return grunt.warn(err);
			}
			if(stats.failed) {
				return grunt.warn(stats.failed + ' test(s) failed');
			}
			done();
		});
	});
}