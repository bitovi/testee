(function () {
	var Reporter;

	Testee.window.mocha = {
		reporter : function(RegisteredReporter) {
			Reporter = RegisteredReporter;
		}
	};
	Testee.window.Mocha = {
		reporters : {}
	}

	// Stub the stuff out we are checking for
	describe('Mocha adapter test', function () {

		it('Initializes', function () {
			expect(Testee.window.Mocha).to.have.property('reporters');
			expect(Reporter).to.be.a('function');
		});

	});
})();