(function(window) {
	window.io = new window.EventEmitter();
	window.io.connect = function() {
		return this;
	}
})(this);