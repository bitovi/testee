(function() {
	var TesteeReporter = function() {

	}

	_.extend(TesteeReporter.prototype, {
		log : function(string) {

		},

		reportRunnerStarting : function(runner) {

		},

		reportRunnerResults : function(runner) {

		},

		reportSpecResults : function(spec) {

		},

		reportSpecStarting : function(spec) {

		},

		reportSuiteResults : function(suite) {

		}
	});

	jasmine.getEnv().addReporter(new TesteeReporter());
})();
