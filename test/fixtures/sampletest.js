var assert = require('assert');
var expect = require('expect.js');

// Redirect both into fixture files:
// mocha test/fixtures/sampletest.js 1> out.log 2>&1

// Run Mocha programatically
// var m = new Mocha();
// m.timeout(200);
// m.addFile('./test/mocha/mochatest.js');
// m.reporter(SwarmReporter);
// m.run();

describe("Main suite", function() {
	describe("Some stuff", function() {
		it('passes assert', function() {
			assert.equal(-1, [1,2,3].indexOf(4));
		});

		it('passes expect', function() {
			expect(true).to.be(true);
		});

		it('fails expect', function() {
			expect(1).to.equal(2);
		});

		it('is async', function(done) {
			setTimeout(function() {
				expect('async done').to.equal('async done');
				done();
			}, 100)
		});

		it('is pending');

		it.skip('is skipped', function() {});

		it('times out', function(done) {
			expect(1).to.equal(1);
		});
	});
});
