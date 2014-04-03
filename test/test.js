var expect = require('expect.js');
var testee = require('../lib/testee');

describe('Testee', function () {

	it('Should return an error when opening a file that doesn\'t exist',
		function(done) {
			// Silence the console so this doesn't appear to be an error.
			var log = console.log;
			var error = console.error;
			console.log = function(){};
			console.error = function(){};

			testee.test('some/file/fake.html', {
				timeout: 1,
			}, function(err) {
				console.log = log;
				console.error = error;

				expect(err).to.be.an(Error);
				done();
			});
		});

});
