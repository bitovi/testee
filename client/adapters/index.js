!function () {
	'use strict';

	var Testee = window.Testee = _.extend({
		window: window,
		_: _.noConflict(),
		adapters: [],
		init: function() {
			var _ = this._;
			var win = this.window;
			_.each(this.adapters, function(adapter) {
				adapter.call(Testee, win, _);
			});
		},
		addAdapter: function(fn) {
			this.adapters.push(fn);
		}
	}, window.Testee);
}();