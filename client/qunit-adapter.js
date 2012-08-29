(function () {
	var evts = ['begin', 'testStart', 'testDone', 'moduleStart', 'moduleDone', 'done', 'log'],
		listeners = {},
		dispatch = function (type, data) {
			if (type in listeners) {
				for (var i = listeners[type].length - 1; i >= 0; i--) {
					listeners[type][i].call(QUnit, data);
				}
			}
		};

	/**
	 * Adds an event mechanism to QUnit.
	 *
	 *  QUnit.on('testStart', function(o) {
	 *      console.log(o);
	 *  });
	 *
	 *  @see https://github.com/spjwebster/qunit-events
	 */
	QUnit.extend(QUnit, {
		on : function (type, callback) {
			if (false === type in listeners) {
				listeners[type] = [];
			}
			listeners[type].push(callback);
		},
		events : evts
	});

	// Bind event handlers
	for (var i = 0; i < evts.length; i++) {
		(function (type) {
			var old = QUnit[type];
			QUnit[type] = function (data) {
				if (old) {
					old.apply(this, arguments);
				}
				dispatch(type, data);
			};
		})(evts[i]);
	}

	for (var i = 0; i < QUnit.events.length; i++) {
		var socket = io.connect();
		(function (type) {
			QUnit.on(type, function (o) {
				console.log(type, o);
				socket.emit('QUnit.' + type, o);
			});
		})(QUnit.events[i]);
	}

})();
