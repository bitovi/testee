(function (QUnit) {
	var curId = 0;
	var socket = io.connect();
	var time = function() {
		return new Date().getTime();
	}
	var add = function(type, fn) {
		var old = QUnit[type];
		QUnit[type] = function() {
			fn.apply(this, arguments);
			return old.apply(QUnit, arguments);
		}
	};

	add('begin', function() {
		socket.emit('start', {
			environment : navigator.userAgent,
			runner : 'QUnit',
			time : time()
		});

		socket.emit('suite', {
			title : document.getElementsByTagName('title')[0].innerHTML,
			root : true,
			pending : false,
			id : curId++
		});
	});

	add('moduleStart', function(data) {
		socket.emit('suite', {

		});
	});

	add('moduleDone', function(data) {
		socket.emit('suite end', {

		})
	});

	add('testStart', function(data) {
		socket.emit('suite', {
		});
	});

	add('testEnd', function(data) {
		socket.emit('suite end', {

		});
	});

	add('log', function(data) {
		socket.emit('test', {});
		if(data.result) {
			socket.emit('pass', {
				title : data.message
			});
		} else {
			socket.emit('fail', {
				title : data.message,
				error : 'Expected ' + data.expected + ' but was ' + data.actual
			});
		}
		socket.emit('test end', {

		});
	});

	add('done', function(data) {
		socket.emit('end', {

		});
	});
})(QUnit);
