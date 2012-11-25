var testee = require('./lib/testee');

// Possible settings (and defaults):
//	{
//		launch : 'local', // local, remote, browserstack
//	    tunnel : 'local', // local, localtunnel, pagekite
//		browser : 'phantom',
//		root : '.', // HTTP server root
//		reporter : 'Spec',
//		port : 3996,
//		verbose : false,
//		log : './testee.log',
//		timeout : 600
//	}

testee.test('examples/qunit/qunit.html', {
	tunnel : 'localtunnel',
	launch : {
		type : 'browserstack',
		username : 'david@bitovi.com',
		password : 'jupiterit1!'
	},
	browser : {
		os : 'win',
		version : '10.0',
		browser : 'ie'
	}
}, function(error, results) {
	console.log(arguments);
	process.exit();
});
//ie:8.0@win