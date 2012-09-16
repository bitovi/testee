var _ = require('underscore');

module.exports = {
	Server : require('./'),
	write : {
		console : require('./../node_modules/swarmness/lib/writers/console')
	},
	socketio : require('./handlers/socketio'),
	rest : require('./handlers/rest'),
	defaults : {
		// Default events the server will be listening to
		events : ['testRunnerInit', 'testStart', 'testDone', 'testAssert', 'testSuiteStart', 'testSuiteDone', 'testRunnerExit'],
		// The key of the authentication token
		token : '__token',
		exitEvent : 'testRunnerExit'
	},
	createServer : function(config) {
		return this.Server.create(_.extend(this.defaults, config));
	}
}
