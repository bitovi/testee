(function (QUnit) {
	var socket = io.connect();
	var time = function() {
		return new Date().getTime();
	}
	var wrap = function(type, event, converter) {
		var old = QUnit[type];
		QUnit[type] = function(data) {
			var converted = converter ? converter(data) : data;
			old.apply(QUnit, arguments);
			console.log(type, data, event, converted);
			socket.emit(event, converted);
		}
	}

	wrap('begin', 'testRunnerInit', function(data) {
		var title = document.getElementsByTagName('h1')[0];
		return {
			name : title ? title.innerHTML : '',
			environment : navigator.userAgent,
			runnter : 'QUnit',
			time : time()
		}
	});

	wrap('testStart', 'testStart', function(data) {
		return {
			name : data.name,
			time : time()
		};
	});

	wrap('testDone', 'testDone', function(data) {
		return data;
	});

	wrap('log', 'testAssert', function(data) {
		return data;
	});

	wrap('moduleStart', 'testSuiteStart', function(data) {
		return data;
	});

	wrap('moduleDone', 'testSuiteDone', function(data) {
		return data;
	});

	wrap('done', 'testRunnerExit', function(data) {
		return data;
	});
})(QUnit);
