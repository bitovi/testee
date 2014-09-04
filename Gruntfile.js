'use strict';

module.exports = function (grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		meta: {
			adapters: 'client/adapters',
			dist: 'client/dist',
			components: 'client/components',
			banner: '/*!\n * <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
				'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
				'<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
				' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
				' * Licensed <%= _.pluck(pkg.licenses, "name").join(", ") %>\n */\n'
		},
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
		concat: {
			options: {
				stripBanners: true,
				banner: '<%= meta.banner %>'
			},
			adapters: {
				src: [
					'<%= meta.components %>/underscore/underscore.js',
					'<%= meta.adapters %>/index.js',
					'<%= meta.adapters %>/mocha.js',
					'<%= meta.adapters %>/qunit.js',
					'<%= meta.adapters %>/jasmine.js',
					'<%= meta.adapters %>/bootstrap.js'
				],
				dest: '<%= meta.dist %>/<%= pkg.name %>.js'
			}
		},
		uglify: {
			options: {
				banner: '<%= meta.banner %>'
			},
			adapters: {
				files: {
					'<%= meta.dist %>/<%= pkg.name %>.min.js': '<%= meta.dist %>/<%= pkg.name %>.js'
				}
			}
		},
		testee: {
			local: {
				options: {
					urls: ['client/examples/qunit/index.html'],
					browsers: ['ie']
				}
			},

			win7: {
				options: {
					port: 4040,
					urls: ['http://pivotal.github.io/jasmine/'],
					browsers: ['ie'],
					tunnel: {
						"type": "local",
						"hostname": "192.168.2.100"
					},
					"launch": {
						"type": "remote",
						"host": "192.168.179.129",
						port: 8080,
						"username": "launcher",
						"password": "testing"
					}
				}
			}
		},
    release: {}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-release');

	grunt.loadTasks('tasks');

	grunt.registerTask('adapters', [ 'concat', 'uglify' ]);
	// Default task.
	grunt.registerTask('default', 'jshint');

};
