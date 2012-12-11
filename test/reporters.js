/*global describe, it*/
"use strict";

var EventEmitter = require('events').EventEmitter;
var Mocha = require('mocha');
var Converter = require('../lib/converter');

var run = function (converter, Reporter) {
	var runner = new EventEmitter();

	new Reporter(converter.run(runner));

	runner.emit("start", {
		"environment": "Node",
		"runner": "Unittest"
	});
	runner.emit("suite", {
		"title": "",
		"pending": false,
		"root": true,
		"id": 0
	});
	runner.emit("suite", {
		"title": "Main suite",
		"pending": false,
		"root": false,
		"parent": 0,
		"id": 1
	});
	runner.emit("suite", {
		"title": "Some stuff",
		"pending": false,
		"root": false,
		"parent": 1,
		"id": 2
	});
	runner.emit("test", {
		"title": "passes assert",
		"async": 0,
		"sync": true,
		"timedOut": false,
		"pending": false,
		"type": "test",
		"parent": 2,
		"id": 3
	});
	runner.emit("pass", {
		"duration": 0,
		"state": "passed",
		"id": 3
	});
	runner.emit("test end", {
		"id": 3
	});
	runner.emit("test", {
		"title": "passes expect",
		"async": 0,
		"sync": true,
		"timedOut": false,
		"pending": false,
		"type": "test",
		"parent": 2,
		"id": 4
	});
	runner.emit("pass", {
		"duration": 1,
		"state": "passed",
		"id": 4
	});
	runner.emit("test end", {
		"id": 4
	});
	runner.emit("test", {
		"title": "fails expect",
		"async": 0,
		"sync": true,
		"timedOut": false,
		"pending": false,
		"type": "test",
		"parent": 2,
		"id": 5
	});
	runner.emit("fail", {
		"state": "failed",
		"id": 5,
		"err": {
			"message": "expected 1 to equal 2",
			"stack": "Error: expected 1 to equal 2\n    at Assertion.assert (/Users/daff/Development/node/swarmling/node_modules/expect.js/expect.js:99:13)\n    CUSTOM STACK TRACE"
		}
	});
	runner.emit("test end", {
		"id": 5
	});
	runner.emit("pending", {
		"title": "is pending",
		"sync": true,
		"timedOut": false,
		"pending": true,
		"type": "test",
		"parent": 2,
		"id": 6
	});
	runner.emit("test end", {
		"id": 6
	});
	runner.emit("test", {
		"title": "is async",
		"async": 1,
		"sync": false,
		"timedOut": false,
		"pending": false,
		"type": "test",
		"parent": 2,
		"id": 7
	});
	runner.emit("pass", {
		"duration": 107,
		"state": "passed",
		"id": 7
	});
	runner.emit("test end", {
		"id": 7
	});
	runner.emit("pending", {
		"title": "is inclusive (skipped)",
		"sync": true,
		"timedOut": false,
		"pending": true,
		"type": "test",
		"parent": 2,
		"id": 8
	});
	runner.emit("test end", {
		"id": 8
	});
	runner.emit("test", {
		"title": "times out",
		"async": 1,
		"sync": false,
		"timedOut": false,
		"pending": false,
		"type": "test",
		"parent": 2,
		"id": 9
	});
	runner.emit("fail", {
		"duration": 201,
		"state": "failed",
		"id": 9,
		"err": {
			"message": "timeout of 200ms exceeded",
			"stack": "Error: timeout of 200ms exceeded\n    at Object.<anonymous> (/Users/daff/Development/node/swarmling/node_modules/mocha/lib/runnable.js:142:14)\n    at Timer.ontimeout (timers.js:94:19)"
		}
	});
	runner.emit("test end", {
		"id": 9
	});
	runner.emit("suite end", {
		"id": 2
	});
	runner.emit("suite end", {
		"id": 1
	});
	runner.emit("suite end", {
		"id": 0
	});
	runner.emit("end", {
		"id": 10
	});
};

describe('Mocha reporter compatiblity', function () {
	var skip = [ 'HTML', 'Base', 'Markdown' ];
	var oldstdout = process.stdout.write;
	var oldstderr = process.stderr.write;
	Object.keys(Mocha.reporters).forEach(function (name) {
		// For now we just test reporters by making sure that we don't get any errors when running
		// some dummy data through the converter
		var fn = skip.indexOf(name) === -1 ? it : it.skip;
		var converter = new Converter();
		fn('Runs with ' + name, function () {
			// We don't want stuff to log to the console
			process.stdout.write = function () {
			};
			process.stderr.write = function () {
			};
			run(converter, Mocha.reporters[name]);
			// Reset it once the reporter ran
			process.stdout.write = oldstdout;
			process.stderr.write = oldstderr;
		});
	});
});
