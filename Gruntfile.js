'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      lib: ['lib/**/*.js', 'Gruntfile.js'],
      test: 'test/**/*.js'
    },

    release: {},

    simplemocha: {
      options: {
        timeout: 30000
      },
      all: ['test/**/*.js']
    },

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
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-simple-mocha');

  grunt.loadTasks('tasks');

  grunt.registerTask('test', [ 'jshint', 'simplemocha' ]);
  grunt.registerTask('default', 'test');
};
