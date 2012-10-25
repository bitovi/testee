var _ = require('underscore');

module.exports = {
	Server : require('./server'),
	socketio : require('./socketio'),
	injector : require('./static'),
	defaults : {
		// The key of the authentication token
		token : '__token',
		exitEvent : 'end'
	},
	createServer : function(config) {
		return new this.Server(_.extend(this.defaults, config));
	}
}
