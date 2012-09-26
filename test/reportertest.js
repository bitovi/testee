var mocha = require('mocha');
var EventEmitter = require('events').EventEmitter;

var runner = new EventEmitter();
runner.setMaxListeners(20);

new mocha.reporters.Spec(runner);

runner.emit("start", undefined, undefined);
runner.emit("suite", {"title" : "", "pending" : false, "root" : true}, undefined);
runner.emit("suite", {"title" : "StringCalculator", "pending" : false, "root" : false}, undefined);
runner.emit("suite", {"title" : "when an empty string is passed in", "pending" : false, "root" : false}, undefined);
runner.emit("test", {"title" : "returns 0", "async" : 0, "sync" : true, "timedOut" : false, "pending" : false, "type" : "test", "parent" : {"title" : "when an empty string is passed in", "pending" : false, "root" : false}}, undefined);
runner.emit("pass", {"title" : "returns 0", "async" : 0, "sync" : true, "timedOut" : false, "pending" : false, "type" : "test", "duration" : 0, "state" : "passed", "parent" : {"title" : "when an empty string is passed in", "pending" : false, "root" : false}}, undefined);
runner.emit("test end", {"title" : "returns 0", "async" : 0, "sync" : true, "timedOut" : false, "pending" : false, "type" : "test", "duration" : 0, "state" : "passed", "speed" : "fast", "parent" : {"title" : "when an empty string is passed in", "pending" : false, "root" : false}}, undefined);
runner.emit("suite end", {"title" : "when an empty string is passed in", "pending" : false, "root" : false}, undefined);
runner.emit("suite", {"title" : "when a number is passed in", "pending" : false, "root" : false}, undefined);
runner.emit("test", {"title" : "returns the number", "async" : 0, "sync" : true, "timedOut" : false, "pending" : false, "type" : "test", "parent" : {"title" : "when a number is passed in", "pending" : false, "root" : false}}, undefined);
runner.emit("pass", {"title" : "returns the number", "async" : 0, "sync" : true, "timedOut" : false, "pending" : false, "type" : "test", "duration" : 0, "state" : "passed", "parent" : {"title" : "when a number is passed in", "pending" : false, "root" : false}}, undefined);
runner.emit("test end", {"title" : "returns the number", "async" : 0, "sync" : true, "timedOut" : false, "pending" : false, "type" : "test", "duration" : 0, "state" : "passed", "speed" : "fast", "parent" : {"title" : "when a number is passed in", "pending" : false, "root" : false}}, undefined);
runner.emit("suite end", {"title" : "when a number is passed in", "pending" : false, "root" : false}, undefined);
runner.emit("suite", {"title" : "when string is passed in", "pending" : false, "root" : false}, undefined);
runner.emit("test", {"title" : "returns NaN", "async" : 0, "sync" : true, "timedOut" : false, "pending" : false, "type" : "test", "parent" : {"title" : "when string is passed in", "pending" : false, "root" : false}}, undefined);
runner.emit("fail", {"title" : "returns NaN", "async" : 0, "sync" : true, "timedOut" : false, "pending" : false, "type" : "test", "state" : "failed", "parent" : {"title" : "when string is passed in", "pending" : false, "root" : false}}, {"message" : "failed"});
runner.emit("test end", {"title" : "returns NaN", "async" : 0, "sync" : true, "timedOut" : false, "pending" : false, "type" : "test", "state" : "failed", "parent" : {"title" : "when string is passed in", "pending" : false, "root" : false}, "err" : {"message" : "failed"}}, undefined);
runner.emit("suite end", {"title" : "when string is passed in", "pending" : false, "root" : false}, undefined);
runner.emit("suite", {"title" : "when '1,2' is passed in", "pending" : false, "root" : false}, undefined);
runner.emit("test", {"title" : "returns 3", "async" : 0, "sync" : true, "timedOut" : false, "pending" : false, "type" : "test", "parent" : {"title" : "when '1,2' is passed in", "pending" : false, "root" : false}}, undefined);
runner.emit("pass", {"title" : "returns 3", "async" : 0, "sync" : true, "timedOut" : false, "pending" : false, "type" : "test", "duration" : 0, "state" : "passed", "parent" : {"title" : "when '1,2' is passed in", "pending" : false, "root" : false}}, undefined);
runner.emit("test end", {"title" : "returns 3", "async" : 0, "sync" : true, "timedOut" : false, "pending" : false, "type" : "test", "duration" : 0, "state" : "passed", "speed" : "fast", "parent" : {"title" : "when '1,2' is passed in", "pending" : false, "root" : false}}, undefined);
runner.emit("suite end", {"title" : "when '1,2' is passed in", "pending" : false, "root" : false}, undefined);
runner.emit("suite end", {"title" : "StringCalculator", "pending" : false, "root" : false}, undefined);
runner.emit("suite end", {"title" : "", "pending" : false, "root" : true}, undefined);
runner.emit("end", undefined, undefined); 