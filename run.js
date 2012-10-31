var testee = require('./lib/testee');

// Possible settings (and defaults):
//	{
//		launch : 'local', // local, remote, browserstack
//			tunnel : 'local', // local, localtunnel, pagekite
//		browser : 'phantom',
//		root : '.', // HTTP server root
//		reporter : 'Spec',
//		port : 3996,
//		verbose : false,
//		log : './testee.log',
//		timeout : 600
//	}

testee.test('examples/qunit/qunit.html', {
	port : 4444
}, function(error, results) {
	process.exit();
});
