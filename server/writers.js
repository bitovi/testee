exports.logger = function(emitter, out) {
	var print = function(text) {
		out.write(text + "\n");
	}

	emitter.on('QUnit.begin', function() {
		print("Starting ...");
	});

	emitter.on('QUnit.log', function(o){
		var result = o.result,
			message = o.message || 'okay';

		// Testdox layout
		if(result) {
			print('    [x] ' + message);
		} else {
			print('    [ ] ' + message);
			if(o.expected) {
				print('        Actual: ' + o.actual);
				print('        Expected: ' + o.expected);
			}
		}
	});

	emitter.on('QUnit.testStart', function(o){
		print('  ' + o.name);
	});

	emitter.on('QUnit.moduleStart', function(o){
		print("\n" + o.name);
	});

	emitter.once('QUnit.done', function(o) {
		if(o.failed > 0) {
			print("\n" + 'FAILURES!');
			print('Tests: ' + o.total
				+ ', Passed: ' + o.passed,
				+ ', Failures: ' + o.failed);
		} else {
			print("\n" + 'SUCESS!');
			print('Tests: ' + o.total);
		}
		print('Took: ' + o.runtime + 'ms');
	});
}
