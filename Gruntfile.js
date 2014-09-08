'use strict';

module.exports = function (grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
//			options: {
//				jshintrc: {
//					options: {
//						curly: true,
//						eqeqeq: true,
//						immed: true,
//						latedef: true,
//						newcap: true,
//						noarg: true,
//						sub: true,
//						undef: true,
//						boss: true,
//						eqnull: true,
//						node: true
//					}
//				},
//				globals: {
//					exports: true
//				}
//			},
			lib: [ 'lib/**/*.js' ]
		},

    release: {},

    testee: {
      options: {
        reporter: 'Spec'
      },
      examples: [
        'examples/mocha/index.html',
        'examples/qunit/index.html',
        'examples/jasmine/index.html'
      ]
    }
	});

  grunt.loadNpmTasks('grunt-release');

	grunt.loadTasks('tasks');

	// Default task.
	grunt.registerTask('default', 'jshint');
};
