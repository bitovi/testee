module.exports = function (grunt) {

	grunt.initConfig({
		testee : {
			example : 'examples/mocha/mocha.html'
		}
	});

	grunt.loadTasks('./tasks');
	grunt.registerTask('default', 'testee');
};