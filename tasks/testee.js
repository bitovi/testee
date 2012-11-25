var testee = require('../lib/testee');

module.exports = function(grunt) {
	grunt.registerTask('testee', 'Run tests', function() {
		var configuration = grunt.config(['testee', this.target]);
		var files = grunt.file.expand(this.file.src);
		testee.test(files, configuration, function (error, results) {
			if(error) {
				return grunt.fail(err);
			}
		});
	});
}