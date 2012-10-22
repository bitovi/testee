module.exports = function(configuration) {
	var defaults = {
		test : 'local', // local, remote, browserstack
		// configuration for local browsers
		local : {
		},
		// configuration for browserstack browsers
		browserstack : {
		},
		// default configuration for local browsers
		remote : {
			username : 'launchpad',
			password : 'password'
		},
		tunnel : 'local', // local, localtunnel, pagekite
		browser : [ 'phantom' ],
		root : '.', // HTTP server root
		port : 3996
	}
}