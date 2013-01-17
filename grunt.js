module.exports = function(grunt) {
	grunt.initConfig({
		watch: {
	      files: [ 'index.md', '_includes/**', '_layouts/**', '_resources/**' ],
	      tasks: [ 'default' ]
	    },

    	concat: {
	        dist: {
		      src: [ '_resources/jquery.scrollfix.js', '_resources/rainbow.js', '_resources/language/javascript.js' ],
		      dest: '_resources/all.js'
		    }
		},

	  	min: {
		    dist: {
		      src: ['_resources/all.js'],
		      dest: 'all.min.js'
		    }
		  }
	});

	grunt.registerTask('jekyll', function() {
		var done = this.async();
		grunt.utils.spawn({
			cmd : 'jekyll'
		}, function(err, stdout, stderr) {
			grunt.log.writeln(stdout);
			done(err);
		});
	});

	grunt.registerTask('less', function() {
		var done = this.async();
		grunt.utils.spawn({
			cmd: 'lessc',
			args: [ '_resources/less/styles.less', 'styles.css' ]
		}, function(err, stdout, stderr) {
			grunt.log.writeln(stdout);
			done(err);
		});
	});

	grunt.registerTask('default', 'js less jekyll');
	grunt.registerTask('js', 'concat min');
}