module.exports = function (grunt) {

	grunt.initConfig({
		testee : {
			mocha : 'examples/mocha/mocha.html',
			qunit : 'examples/qunit/qunit.html'
		}
	});

	grunt.loadTasks('./tasks');
	grunt.registerTask('default', 'testee');
};