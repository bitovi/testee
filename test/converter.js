runner.emit('start', {
	"environment" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.4 (KHTML, like Gecko) Chrome/22.0.1229.79 Safari/537.4",
	"runner" : "Mocha",
	"time" : 1348630364771
});

runner.emit('suite', {
	"title" : "",
	"pending" : false,
	"root" : true,
	"id" : 0
});

runner.emit('suite', {
	"title" : "StringCalculator",
	"pending" : false,
	"root" : false,
	"parent" : 0,
	"id" : 1
});

runner.emit('suite', {
	"title" : "when an empty string is passed in",
	"pending" : false,
	"root" : false,
	"parent" : 1,
	"id" : 2
});

runner.emit('test', {
	"title" : "returns 0",
	"async" : 0,
	"sync" : true,
	"timedOut" : false,
	"pending" : false,
	"type" : "test",
	"parent" : 2,
	"id" : 3
});

runner.emit('pass', {
	"duration" : 1,
	"state" : "passed",
	"speed" : "fast",
	"id" : 3
});

runner.emit('fail', {
	"state" : "failed",
	"id" : 3
});

runner.emit('test end', {
	"id" : 3
});

runner.emit('suite end', {
	"id" : 2
});

runner.emit('suite', {
	"title" : "when a number is passed in",
	"pending" : false,
	"root" : false,
	"parent" : 1,
	"id" : 4
});

runner.emit('test', {
	"title" : "returns the number",
	"async" : 0,
	"sync" : true,
	"timedOut" : false,
	"pending" : false,
	"type" : "test",
	"parent" : 4,
	"id" : 5
});

runner.emit('pass', {
	"duration" : 1,
	"state" : "passed",
	"speed" : "fast",
	"id" : 5
});

runner.emit('test end', {
	"id" : 5
});

runner.emit('test', {
	"title" : "does some wild stuff",
	"async" : 0,
	"sync" : true,
	"timedOut" : false,
	"pending" : false,
	"type" : "test",
	"parent" : 4,
	"id" : 6
});

runner.emit('pass', {
	"duration" : 0,
	"state" : "passed",
	"speed" : "fast",
	"id" : 6
});

runner.emit('test end', {
	"id" : 6
});

runner.emit('suite end', {
	"id" : 4
});

runner.emit('suite', {
	"title" : "Some stuff",
	"pending" : false,
	"root" : false,
	"parent" : 1,
	"id" : 7
});

runner.emit('test', {
	"title" : "does stuff",
	"async" : 0,
	"sync" : true,
	"timedOut" : false,
	"pending" : false,
	"type" : "test",
	"parent" : 7,
	"id" : 8
});

runner.emit('pass', {
	"duration" : 0,
	"state" : "passed",
	"speed" : "fast",
	"id" : 8
});

runner.emit('test end', {
	"id" : 8
});

runner.emit('suite end', {
	"id" : 7
});

runner.emit('suite', {
	"title" : "Some stuff",
	"pending" : false,
	"root" : false,
	"parent" : 1,
	"id" : 9
});

runner.emit('test', {
	"title" : "does stuff",
	"async" : 0,
	"sync" : true,
	"timedOut" : false,
	"pending" : false,
	"type" : "test",
	"parent" : 9,
	"id" : 10
});

runner.emit('pass', {
	"duration" : 0,
	"state" : "passed",
	"speed" : "fast",
	"id" : 10
});

runner.emit('test end', {
	"id" : 10
});

runner.emit('suite end', {
	"id" : 9
});

runner.emit('suite', {
	"title" : "when '1,2' is passed in",
	"pending" : false,
	"root" : false,
	"parent" : 1,
	"id" : 11
});

runner.emit('test', {
	"title" : "returns 3",
	"async" : 0,
	"sync" : true,
	"timedOut" : false,
	"pending" : false,
	"type" : "test",
	"parent" : 11,
	"id" : 12
});

runner.emit('pass', {
	"duration" : 0,
	"state" : "passed",
	"speed" : "fast",
	"id" : 12
});

runner.emit('test end', {
	"id" : 12
});

runner.emit('suite end', {
	"id" : 11
});

runner.emit('suite end', {
	"id" : 1
});

runner.emit('suite end', {
	"id" : 0
});

runner.emit('end', {
	"id" : 13
});
