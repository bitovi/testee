(function () {
	Testee.window.mocha = {}
	Testee.window.Mocha = {
		reporters : {}
	}

	// Stub the stuff out we are checking for
	describe('Mocha adapter test', function () {

		it('Initializes', function () {
			expect(Testee.window.Mocha).to.have.property('reporters');
		});

	});
})();