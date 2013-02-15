!function (Testee, undefined) {
	'use strict';

	Testee.addAdapter(function (win, _, socket) {
		if (!(win.mocha && win.Mocha)) {
			return;
		}

		// TODO find out why it detects a leak, only in V8
		mocha.ignoreLeaks();
		var OldReporter = mocha._reporter;
		var MochaReporter = function (runner) {
			var self = this;
			var methodMappings = {
				'test end': 'testEnd',
				'suite end': 'suiteEnd'
			}
			var pipe = function (type, converter) {
				runner.on(type, function () {
					var data = converter.apply(converter, arguments);
					var method = methodMappings[type] || type;
					Testee[method](data);
				});
			}

			this.originalReporter = new OldReporter(runner);
			this.ids = [];
			this.last = {};

			pipe('start', function () {
				return {
					environment: navigator.userAgent,
					runner: 'Mocha',
					time: new Date().getTime()
				}
			});

			pipe('fail', function (data, err) {
				var diff = self.diff(data);
				diff.err = {
					message: err.message,
					stack: err.stack || ''
				}
				return diff;
			});

			_.each(['suite', 'suite end', 'pending', 'test', 'test end', 'pass', 'end'], function (name) {
				pipe(name, _.bind(self.diff, self));
			});
		};

		MochaReporter.prototype.objectify = function (data) {
			var result = {};
			var self = this;

			_.each(data, function (value, key) {
				var isPrivate = key.indexOf('_') === 0 || key.indexOf('$') === 0;
				if (typeof value === 'object' && !isPrivate) {
					var idx = _.indexOf(self.ids, value);
					if (!!~idx) {
						result[key] = idx;
					}
				} else if (typeof value !== 'function' && !isPrivate && value !== undefined) {
					result[key] = value;
				}
			});
			return result;
		}

		MochaReporter.prototype.diff = function (obj) {
			var self = this;
			var current = self.objectify(obj);
			var result = {};
			var idx = _.indexOf(self.ids, obj);

			if (!~idx) {
				idx = self.ids.push(obj) - 1;
				result = _.clone(current || {});
			} else {
				_.each(current, function (value, key) {
					if (self.last[idx][key] !== value) {
						result[key] = value;
					}
				});
			}

			self.last[idx] = current;
			result.id = idx;
			return result;
		}

		win.Mocha.reporters.Testee = MochaReporter;
		win.mocha.reporter(MochaReporter);
		return MochaReporter;
	});
}(Testee);