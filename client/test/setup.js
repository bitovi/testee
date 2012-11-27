(function(window) {
	window.io = {
		connect : function() {
			return new window.EventEmitter();
		}
	};
	window.Testee = {
		window : {}
	};
})(this);