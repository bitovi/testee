(function(win) {
	var mocha = win.mocha;
	var socket = io.connect();
	socket.emit('funnyEvent', 'Some funny event');
	var objectify = function(data) {
		if(!data) {
			return undefined;
		}

		if(data instanceof Error) {
			return { message : data.message };
		}

		var result = {}, isPrivate, key, value;
		for(key in data) {
			isPrivate = key.indexOf('_') === 0 || key.indexOf('$') === 0;
			value = data[key];
			if(typeof value !== 'object' && typeof value !== 'function' && !isPrivate) {
				result[key] = value;
			}
		}

		if(data instanceof win.Mocha.Test) {
			result.parent = objectify(data.parent);
			if(data.err) {
				result.err = { message : data.err.message }
			}
		}

		return result;
	}

	var OldReporter = mocha._reporter;
	var LogReporter = function(runner) {
		new OldReporter(runner);
		var old = runner.emit;
		runner.emit = function(name, data, error) {
			socket.emit.apply(socket, [ name, objectify(data), objectify(error) ]);
			return old.apply(this, arguments);
		}
	};
	mocha.reporter(LogReporter);
})(this);