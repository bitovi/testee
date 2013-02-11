var path = require('path'),
    fs = require('fs'),
	instrumenter = new (require('istanbul').Instrumenter)();

function instrumentCode(file) {
    var filename = path.resolve(filename),
		code = fs.readFileSync(file, 'utf8');
    return instrumenter.instrumentSync(code, filename);
}

var instrumented = instrumentCode("lib/instrumenter/mytest.js");
console.log(instrumented)