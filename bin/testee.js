#!/usr/bin/env node
var program = require('commander');
var testee = require('../lib/testee');
var _ = require('underscore');
var pkg = require('../package.json');

var runTests = function (files, params) {
	testee.test(files, params, function () {
		process.exit();
	});
}

program.version(pkg.version)
	.usage('[options] <files ...>')
	.description(pkg.description)
	.option('-b, --browser [name]', 'The browser you want to run')
	.option('-l, --launch [name]', 'The browser you want to use. Currently supports local, browserstack or remote')
	.option('-t, --tunnel [name]', 'The tunneling service provider to use. Currently supports local, localtunnel and pagekite')
	.option('-p, --port [port]', 'The port to run the server on')
	.option('-r, --reporter [name]', 'The name of the reporter to use')
	.option('-v, --verbose', 'Writes a log file with debugging information')
	.option('-l, --log [file]', 'If in verbose mode, the name of the logfile to write to')
	.option('--timeout [seconds]', 'The per test timeout (in seconds)')
	.parse(process.argv);

if (program.launch === 'browserstack') {
	program.prompt('Enter your Browserstack username: ', function (username) {
		program.password('Your Browserstack password: ', function (pass) {
			console.log('got "%s"', pass);
			process.stdin.destroy();
		});
	});
} else {
	runTests(program.args, _.pick(program, 'browser', 'launch', 'tunnel',
		'port', 'verbose', 'log', 'timeout', 'reporter'));
}
