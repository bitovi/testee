(function (window, undefined) {
	var socket = window.initIo('mocha');

	describe('Mocha adapter test', function () {
		it('runs the Mocha test and writes expected data to socket', function (done) {
			// Insert the iframe with the test
			var iframe = document.createElement('iframe');

			iframe.src = 'mocha/mocha.html';
			document.getElementById('testarea').appendChild(iframe);

			// Now listen to the events we expect
			socket.on('start', function (data) {
				expect(data.environment).to.equal(navigator.userAgent);
			});

			socket.once('suite', function(data) {
				expect(data.root).to.equal(true);
				expect(data.id).to.equal(0);
				socket.once('suite', function(data) {
					expect(data.title).to.equal('Test module');
					expect(data.parent).to.equal(0);
					expect(data.id).to.equal(1);
					socket.once('suite', function(data) {
						expect(data.title).to.equal('It does something');
						console.log(data);
					});
				});
			});

//			socket.on('test', function(data) {
//				console.log('test', data);
//			});
//
//			socket.on('pass', function(data) {
//				console.log('pass', data);
//			});

			socket.on('end', function () {
				done();
			});
		});
	});
})(this);