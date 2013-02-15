!function (Testee, undefined) {
	'use strict';

	Testee.addAdapter(function (win, _) {
		if (!win.jasmine) {
			return;
		}
		var TesteeReporter = function () {
		};

		_.extend(TesteeReporter.prototype, {
			log: function (string) {
			},

			reportRunnerStarting: function (runner) {
				Testee.start({
					environment: navigator.userAgent,
					runner: 'Jasmine'
				});
			},

			reportRunnerResults: function (runner) {
				Testee.end({});
			},

			reportSpecResults: function (spec) {
				if (spec.results_.failedCount) {
					var message = spec.results_.items_[0].message;
					var stack = spec.results_.items_[0].trace.stack;
					Testee.fail({
						id: spec.id,
						err: {
							message: message,
							stack: stack
						}
					});
				} else if (spec.results_.passedCount) {
					Testee.pass({
						duration: 0,
						id: spec.id
					});
				}

				Testee.testEnd({
					id: spec.id
				});
			},

			startSuite: function (suite) {
				if (suite.parentSuite !== null) {
					if (!suite.parentSuite.started) {
						this.startSuite(suite.parentSuite);
					}
				}

				if (suite.parentSuite !== null) {
					Testee.suite({
						title: suite.description,
						parent: suite.parentSuite.id,
						id: suite.id
					});
				} else {
					Testee.suite({
						title: suite.description,
						root: true,
						id: suite.id
					});
				}

				suite.started = true;
			},

			reportSpecStarting: function (spec) {
				if (!spec.suite.started) {
					this.startSuite(spec.suite);
				}

				Testee.test({
					title: spec.description,
					parent: spec.suite.id,
					id: spec.id
				});
			},

			reportSuiteResults: function (suite) {
				Testee.suiteEnd({
					id: suite.id
				});
			}
		});

		jasmine.getEnv().addReporter(new TesteeReporter());
	});
}(Testee);