(function (win, undefined) {
	if(!win.QUnit) {
		return;
	}

	var QUnit = win.QUnit;
	var currentId = 0; // Track the current global id
	var suites = []; // Contains all currently active suites (nested)
	var socket = io.connect();
	var time = function() {
		return new Date().getTime();
	}
	// Returns the id of the currently active test suite (last one pushed)
	var suiteId = function() {
		return suites[suites.length - 1];
	}
	// Overwrite a QUnit hook
	var add = function(type, fn) {
		var old = QUnit[type];
		QUnit[type] = function() {
			fn.apply(this, arguments);
			return old.apply(QUnit, arguments);
		}
	};

	add('begin', function() {
		var titleEl = document.getElementsByTagName('title')[0] || document.getElementsByTagName('h1')[0];

		socket.emit('start', {
			environment : navigator.userAgent,
			runner : 'QUnit',
			time : time()
		});

		socket.emit('suite', {
			title : titleEl ? titleEl.innerHTML : '',
			root : true,
			id : currentId
		});

		suites.push(currentId);
	});

	add('moduleStart', function(data) {
		socket.emit('suite', {
			title : data.name,
			parent : suiteId(),
			id : (++currentId)
		});
		suites.push(currentId);
	});

	add('moduleDone', function(data) {
		socket.emit('suite end', {
			failed : data.failed,
			total : data.total,
			id : suiteId()
		});
		suites.pop();
	});

	add('testStart', function(data) {
		socket.emit('suite', {
			title : data.name,
			parent : suiteId(),
			id : (++currentId)
		});
		suites.push(currentId);
	});

	add('testDone', function(data) {
		socket.emit('suite end', {
			"id" : suiteId()
		});
		suites.pop();
	});

	add('log', function(data) {
		var testId = (++currentId);

		socket.emit('test', {
			id : testId,
			title : data.message,
			parent : suiteId()
		});

		if(data.result) {
			socket.emit('pass', {
				id : testId
			});
		} else {
			socket.emit('fail', {
				id : testId,
				err : {
					message : data.message,
					stack : 'Expected ' + data.expected + ' but was ' + data.actual + '\n    ' + (data.source || '')
				}
			});
		}

		socket.emit('test end', {
			id : testId
		});
	});

	add('done', function(data) {
		socket.emit('end', data);
	});
})(this);
