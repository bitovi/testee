var server = require('./server');
var hosting = require('./host');
var reporter = require('./reporter');

var serverApp = server();
var app = hosting({
  root: __dirname + '/../examples/'
}).use('/api', serverApp);

serverApp.configure(reporter())
  .setup(app.listen(8080));
