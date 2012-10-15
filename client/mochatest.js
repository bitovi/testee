var StringCalculator = StringCalculator = {
	add: function(inputString) {
		if(inputString === '') {
			return 0;
		}

		var result = 0;
		var inputStrings = inputString.split(',');

		for(var i=0; i<inputStrings.length; i++) {
			result += parseInt(inputStrings[i]);
		}

		return result;
	}
}

describe("StringCalculator", function() {

	describe("when an empty string is passed in", function() {
		it("returns 0", function() {
			var result = StringCalculator.add("");
			assert(result === 0);
		});
	});

	describe("when a number is passed in", function() {
		it("returns the number", function() {
			var result = StringCalculator.add("2");
			assert(result === 2);
		});

		it("does some wild stuff", function() {
			assert(true);
		});
	});

//	describe("when string is passed in", function() {
//		it("returns NaN", function() {
//			var result = 1;
//			assert(isNaN(result));
//		});
//	});

//	describe("Some stuff", function() {
//		it('does stuff', function() {
//			assert(true);
//		});
//		it('is pending');
//	});

//	describe("Some stuff", function() {
//		it('does stuff', function() {
//			assert(true);
//		});
//	});
//
//	describe("when '1,2' is passed in", function() {
//		it("returns 3", function() {
//			var result = StringCalculator.add("1,2");
//			assert(result === 3);
//		});
//	});
});

describe('User', function(){
	describe('#save()', function(){
		it('should save without error', function(done){
			setTimeout(function() {
				done();
			}, 200)
		})
	})
});