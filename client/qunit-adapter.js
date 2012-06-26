(function () {
	var evts = ['begin', 'testStart', 'testDone', 'moduleStart', 'moduleDone', 'done', 'log'],
		type,
		orig = {},
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
		type = evts[i];
		(function (type) {
			QUnit[type](function (data) {
				if (orig[type]) {
					orig[type].apply(this, arguments);
				}
				dispatch(type, data);
			});
		})(type);
	}

	var matches = window.location.href.match(/(?:websocket=)([^&#]*)/),
		loadScript = function (url, callback) {
			var script = document.createElement("script")
			script.type = "text/javascript";

			if (script.readyState) {  //IE
				script.onreadystatechange = function () {
					if (script.readyState == "loaded" ||
						script.readyState == "complete") {
						script.onreadystatechange = null;
						callback();
					}
				};
			} else {  //Others
				script.onload = function () {
					callback();
				};
			}

			script.src = url;
			document.getElementsByTagName("head")[0].appendChild(script);
		},
		url = 'http://localhost:3996',
		clientLib;

	if (matches && matches[1]) {
		if (matches[1] !== 'true') {
			url = matches[1];
		}
		clientLib = url + '/socket.io/socket.io.js';
		loadScript(clientLib, function() {
			var socket = io.connect(url);
			for (var i = 0; i < QUnit.events.length; i++) {
				(function (type) {
					QUnit.on(type, function (o) {
						socket.emit('QUnit.' + type, o);
					});
				})(QUnit.events[i]);
			}
		});
	}

})();
