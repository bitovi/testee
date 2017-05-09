var feathers = require('feathers');
var rest = require('feathers-rest');
var bodyParser = require('body-parser');
var socketio = require('feathers-socketio');
var memory = require('feathers-memory');
var debug = require('debug')('testee:server');

function nocache(req, res, next) {
    res.setHeader('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    res.setHeader('Pragma', 'No-cache');
    delete req.headers['if-modified-since'];
    delete req.headers['if-none-match'];
    next();
}

var hosting = require('./host');
var api = exports.api = function () {
    debug('initializing Feathers API');
    return feathers()
        .use(nocache)
        .use(bodyParser.json())
        .use(bodyParser.urlencoded({ extended: true }))
        .configure(rest())
        .configure(socketio())
        .use('/runs', memory())
        .use('/suites', memory())
        .use('/tests', memory())
        .use('/coverages', memory())
        .use('/logs', memory());
};

// Returns an Express application that hosts a Testee server with the given options:
// `root`: The root URL or path. URLs will be proxied
// `coverage`: If code coverage should be enabled and its settings
exports.create = function (options) {
    // The Feathers API server
    var app = api(options);
    // The file hosting or proxy server
    // Uses the API server as a middleware on the `api/` route
    var host = hosting(options).use('/api', app);
    var oldListen = host.listen;
    var connectionId = 0;
    var connections = {};

    host.listen = function () {
        var server = oldListen.apply(this, arguments);
        server.api = app;
        //Track all connections, remove them when the are closed.
        server.on('connection', function (conn) {
            var key = connectionId++;
            connections[key] = conn;
            conn.on('close', function () {
                delete connections[key];
            });
        });
        //Any open connection will be destroyed
        server.destroy = function (cb) {
            server.close(cb || function () { });
            for (var key in connections) {
                connections[key].destroy();
                delete connections[key];
            }
        };
        return server;
    };

    return host;
};
