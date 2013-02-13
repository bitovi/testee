!function () {
	'use strict';

	window.Testee = _.extend({
		win: window,
		_: _.noConflict(),
		adapters: [],
		socket: io.connect(),
		init: function() {
			this._.each(this.adapters, function(adapter) {
				adapter.call(this, this.win, this._, this.socket);
			}, this);
		},
		addAdapter: function(fn) {
			this.adapters.push(fn);
		},
		done: function(){
			if(window.__coverage__){
				this.socket.emit('coverage', __coverage__);
			}
		}
	}, window.Testee);
}();