!function (Testee, undefined) {
	'use strict';

	Testee.addAdapter(function (win, _, socket) {
		if (!win.QUnit) {
			return;
		}

		var QUnit = win.QUnit;
		var currentId = 0; // Track the current global id
		var suites = []; // Contains all currently active suites (nested)
		var time = function () {
			return new Date().getTime();
		}
		// Returns the id of the currently active test suite (last one pushed)
		var suiteId = function () {
			return suites[suites.length - 1];
		}
		// Overwrite a QUnit hook, but keep the old ones
		var add = function (type, fn) {
			var old = QUnit[type] || function () {
			};
			QUnit[type] = function () {
				fn.apply(this, arguments);
				return old.apply(QUnit, arguments);
			}
		};

		// TODO async tests
		// var oldstart = win.start;
		// var oldstop = win.stop;

		add('begin', function () {
			var titleEl = document.getElementsByTagName('title')[0] || document.getElementsByTagName('h1')[0];

			Testee.start({
				environment: navigator.userAgent,
				runner: 'QUnit',
				time: time()
			});

			Testee.suite({
				title: titleEl ? titleEl.innerHTML : '',
				root: true,
				id: currentId
			});

			suites.push(currentId);
		});

		add('moduleStart', function (data) {
			Testee.suite({
				title: data.name,
				parent: suiteId(),
				id: (++currentId)
			});
			suites.push(currentId);
		});

		add('moduleDone', function (data) {
			Testee.suiteEnd({
				failed: data.failed,
				total: data.total,
				id: suiteId()
			});
			suites.pop();
		});

		add('testStart', function (data) {
			Testee.suite({
				title: data.name,
				parent: suiteId(),
				id: (++currentId)
			});
			suites.push(currentId);
		});

		add('testDone', function (data) {
			Testee.suiteEnd({
				id: suiteId()
			});
			suites.pop();
		});

		add('log', function (data) {
			var testId = (++currentId);

			Testee.test({
				id: testId,
				title: data.message || 'okay',
				parent: suiteId()
			});

			if (data.result) {
				Testee.pass({
					id: testId
				});
			} else {
				Testee.fail({
					id: testId,
					err: {
						message: data.message,
						stack: 'Expected ' + data.expected + ' but was ' + data.actual + '\n    ' + (data.source || '')
					}
				});
			}

			Testee.testEnd({
				id: testId
			});
		});

		add('done', function (data) {
			Testee.end(data);
		});

		return QUnit;
	});
}(Testee);