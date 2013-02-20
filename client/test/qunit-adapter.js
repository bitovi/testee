(function (window, undefined) {
	var socket = window.initIo('qunit');

	describe('QUnit adapter test', function () {
		it('runs the QUnit test and writes expected data to socket', function (done) {
			// Insert the iframe with the test
			var iframe = document.createElement('iframe');

			iframe.src = 'qunit/qunit.html';
			document.getElementById('testarea').appendChild(iframe);

			// Now listen to the events we expect
			socket.on('start', function (data) {
				expect(data.environment).to.equal(navigator.userAgent);
			});

			socket.once('suite', function (data) {
				expect(data.title).to.equal('QUnit example');
				socket.once('suite', function (data) {
						expect(data.title).to.equal('Test module');
					socket.once('suite', function (data) {
						expect(data.title).to.equal('It does something');
					});
				});
			});

			socket.on('test', function() {

			});

			socket.on('end', function () {
				done();
			});

			socket.removeAllListeners();
		});
	});
})(this);