(function (window, undefined) {
	describe('Jasmine adapter test', function () {
		it('runs the test', function (done) {
			// Insert the iframe with the test
			var iframe = document.createElement('iframe');
			var socket = window.io;

			// iframe.src = 'jasmine/jasmine.html';
			// document.getElementById('testarea').appendChild(iframe);

			done();
		});
	});
})(this);