// TODO pass console.logs to a testfile
var hook = module.exports = function(server) {
	console.log.apply(console, arguments);
}

exports.setup = function(server) {

}