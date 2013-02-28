var testee = require('../lib/testee');

module.exports = function(grunt) {
	grunt.registerMultiTask('testee', 'Run tests', function() {
		var configuration = this.data;
		var files = this.files[0].src;
		var done = this.async();
		testee.test(files, configuration, function (error, stats) {
			if(error) {
				return grunt.warn(error);
			}
			if(stats.failed) {
				return grunt.warn(stats.failed + ' test(s) failed');
			}
			done();
		});
	});
}