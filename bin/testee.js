#!/usr/bin/env node
var program = require('commander');
var testee = require('../lib/testee');

//{
//	launch : 'local', // local, remote, browserstack
//	tunnel : 'local', // local, localtunnel, pagekite
//	browser : 'phantom',
//	root : '.', // HTTP server root
//	reporter : 'Spec',
//	port : 3996,
//	verbose : false,
//	log : './testee.log',
//	timeout : 600
//}

program
	.version('0.0.1')
	.usage('[options] <files ...>')
	.option('-b, --browser [name]', 'The browser you want to run')
	.option('-l, --launch [name]', 'The browser you want to use. Currently supports local, browserstack or remote')
	.option('-t, --tunnel [name]', 'The tunneling service provider to use. Currently supports local, localtunnel and pagekite')
	.option('-p, --port [port]', 'The port to run the server on')
	.option('-v, --verbose', 'Writes a log file with debugging information')
	.option('-l, --log [file]', 'If in verbose mode, the name of the logfile to write to')
	.option('-to, --timeout [seconds]', 'The per test timeout (in seconds)')
	.parse(process.argv);

console.log(program);

if(program.launch === 'browserstack') {
	program.prompt('Enter your Browserstack username: ', function(username){
		program.password('Your Browserstack password: ', function(pass){
			console.log('got "%s"', pass);
			process.stdin.destroy();
		});
	});
}
