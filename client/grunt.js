module.exports = function (grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg : '<json:../package.json>',
		meta : {
			banner : '/*!\n * <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
				'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
				'<%= pkg.homepage ? " * " + pkg.homepage + "\n" : "" %>' +
				' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
				' * Licensed <%= _.pluck(pkg.licenses, "name").join(", ") %>\n */'
		},
		concat : {
			dist : {
				src : [
					'<banner:meta.banner>',
					'lib/underscore.js',
					'adapters/index.js',
					'adapters/mocha.js',
					'adapters/qunit.js',
					'adapters/jasmine.js'
				],
				dest : 'dist/<%= pkg.name %>.js'
			}
		},
		min : {
			dist : {
				src : [ '<banner:meta.banner>', '<config:concat.dist.dest>' ],
				dest : 'dist/<%= pkg.name %>.min.js'
			}
		},
		lint : {
			files : ['grunt.js', 'src/**/*.js', 'test/**/*.js']
		},
		jshint : {
			options : {
				curly : true,
				eqeqeq : true,
				immed : true,
				latedef : true,
				newcap : true,
				noarg : true,
				sub : true,
				undef : true,
				boss : true,
				eqnull : true,
				browser : true
			},
			globals : {
				jQuery : true
			}
		},
		watch: {
			files: '<config:concat.dist.src>',
			tasks: 'concat min'
		},
		uglify : {},
		lodash : [ 'extend', 'each', 'indexOf', 'bind' ]
	});

	grunt.registerTask('lodash', 'Builds a custom lodash distributable', function() {
		var done = this.async();
		grunt.log.writeln('Building custom lodash distributable');
		var includes = grunt.config('lodash');
		// var iife = 'iife=;(function(window, undefined){%output%})(window);';
		grunt.utils.spawn({
			cmd : 'lodash',
			args : ['-d', 'include="' + includes.join(', ') + '"'],
			opts : {
				cwd : './lib'
			}
		}, function(error, results) {
			grunt.log.writeln(results);
			done();
		});
	});

//	grunt.initConfig({
//		testee : {
//			mocha : 'examples/mocha/mocha.html',
//			qunit : 'examples/qunit/qunit.html'
//		}
//	});
//
//	grunt.loadTasks('./tasks');
//	grunt.registerTask('default', 'testee');

	// Default task.
	grunt.registerTask('default', 'concat min');
};