// TODO connect REST service
module.exports = function(server) {
	// Create a URI for each server event
	server.config.events.forEach(function(event) {
		server.use('api/' + event, function(req, res) {
			// TODO POST for each event
		});
	});
}