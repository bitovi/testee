console.warn([
  'DEPRECATION:',
  'The Testee Grunt task has been moved to its own project and will be removed in testee@0.7.0.',
  '\nTo migrate, please run `npm install --save-dev grunt-testee`',
  'and replace `grunt.loadNpmTasks("testee");` with `grunt.loadNpmTasks("grunt-testee");`.',
].join(' '))
module.exports = require('grunt-testee');
