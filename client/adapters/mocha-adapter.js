(function(window, mocha) {
	var socket = io.connect();
	var OldReporter = mocha._reporter;
	var SwarmReporter= function(runner) {
		var self = this;
		var pipe = function(type, converter) {
			console.log(type, converter.apply(converter, arguments));
			runner.on(type, function(data) {
				socket.emit.apply(socket, [type].concat(converter.apply(converter, arguments)));
			});
		}

		this.originalReporter = new OldReporter(runner);
		this.ids = [];
		this.last = {};

		pipe('start', function() {
			return {
				environment : navigator.userAgent,
				runner : 'Mocha',
				time : new Date().getTime()
			}
		});

		_.each(["suite", "suite end", "pending", "test", "pass", "fail", "test end", "end"], function(name) {
			pipe(name, _.bind(self.diff, self));
		});
	};

	SwarmReporter.prototype.objectify = function(data) {
		var result = {};
		var self = this;

		_.each(data, function(value, key) {
			var isPrivate = key.indexOf('_') === 0 || key.indexOf('$') === 0;
			if(typeof value === 'object' && !isPrivate) {
				var idx = _.indexOf(self.ids, value);
				if(!!~idx) {
					result[key] = idx;
				}
			} else if(typeof value !== 'function' && !isPrivate) {
				result[key] = value;
			}
		});
		return result;
	}

	SwarmReporter.prototype.diff = function(obj) {
		var self = this;
		var current = self.objectify(obj);
		var result = {};
		var idx = _.indexOf(self.ids, obj);

		if(!~idx) {
			idx = self.ids.push(obj) - 1;
			result = _.clone(current || {});
		} else {
			_.each(current, function(value, key) {
				if(self.last[idx][key] !== value) {
					result[key] = value;
				}
			});
		}

		self.last[idx] = current;
		result.id = idx;
		return result;
	}

	mocha.reporter(SwarmReporter);
})(window, window.mocha);
