module.exports = function(grunt) {
	grunt.initConfig({
		watch: {
	      files: [ 'index.md', 'includes/**', 'layouts/**', 'resources/**' ],
	      tasks: [ 'jekyll' ]
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

	grunt.registerTask('default', 'watch');
}