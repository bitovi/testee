// Sets up the test reporting Feathers server
var feathers = require('feathers');
var memory = require('./service');

module.exports = function() {
  var app = feathers()
    .configure(feathers.rest())
    .configure(feathers.socketio())
    .use('/runs', memory())
    .use('/suites', memory())
    .use('/tests', memory());

  return app;
};
