(function(Testee, _, undefined) {
	var win = Testee.window;

	if(!win.jasmine) {
		return;
	}

    var socket = io.connect();
    var TesteeReporter = function() {

	}

	_.extend(TesteeReporter.prototype, {
		log : function(string) {

		},

		reportRunnerStarting : function(runner) {
            socket.emit("start", {
                environment : navigator.userAgent,
                runner : 'Jasmine'
            });

			_.each(runner.suites, function (suite) {
                if (suite.parentSuite !== null) {
                    socket.emit('suite', {
                        "title": suite.description,
                        "parent": suite.parentSuite.id,
                        "id": suite.id
                    });
                } else {
                    socket.emit('suite', {
                        "title": suite.description,
                        "root": true,
                        "id": suite.id
                    });
                }
            });
		},

		reportRunnerResults : function(runner) {
            socket.emit("end", {});
		},

		reportSpecResults : function(spec) {
            if (spec.results_.failedCount) {
                var message = spec.results_.items_[0].message;
                var stack = spec.results_.items_[0].trace.stack;
                socket.emit("fail", {
                    "id": spec.id,
                    "err": {
                        "message": message,
                        "stack": stack
                    }
                });
            } else if (spec.results_.passedCount) {
                socket.emit("pass", {
                    "duration": 0,
                    "id": spec.id
                });
            }

            socket.emit("test end", {
                "id": spec.id
            });
		},

		reportSpecStarting : function(spec) {
            socket.emit("test", {
                "title": spec.description,
                "parent": spec.suite.id,
                "id": spec.id
            })
		},

		reportSuiteResults : function(suite) {
            socket.emit("suite end", {
                "id": suite.id
            });
		}
	});

	jasmine.getEnv().addReporter(new TesteeReporter());
})(Testee, Testee._);