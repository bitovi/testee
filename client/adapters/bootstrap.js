!function(Testee) {
	if(window.steal) {
		steal.one('end', function() {
			Testee.init();
		});
	} else {
		Testee.init();
	}
	// TODO something for RequireJS
}(Testee);