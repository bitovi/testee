!function () {
	'use strict';

	window.Testee = _.extend({
		win: window,
		_: _.noConflict(),
		adapters: [],
		socket: io.connect(),
		init: function() {
			var oldEmit = this.socket.emit;
			var self = this;
			this._.each(this.adapters, function(adapter) {
				adapter.call(this, this.win, this._);
			}, this);
			this.socket.emit = function() {
				self.log.apply(Testee, arguments);
				return oldEmit.apply(this, arguments);
			}
		},
		log: function() {
			if(this.debug) {
				console.log.apply(console, arguments);
			}
		},
		addAdapter: function(fn) {
			this.adapters.push(fn);
		},
		start: function(data) {
			this.socket.emit('start', data);
		},
		suite: function(data) {
			this.socket.emit('suite', data);
		},
		test: function(data) {
			this.socket.emit('test', data);
		},
		pending: function(data) {
			this.socket.emit('pending', data);
		},
		pass: function(data) {
			this.socket.emit('pass', data);
		},
		fail: function(data) {
			this.socket.emit('fail', data);
		},
		testEnd: function(data) {
			this.socket.emit('test end', data);
		},
		suiteEnd: function(data) {
			this.socket.emit('suite end', data);
		},
		end: function(data) {
			if(window.__coverage__){
				this.socket.emit('coverage', __coverage__);
			}
			this.socket.emit('end', data);
		}
	}, window.Testee);
}();