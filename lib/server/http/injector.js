/*
 * Modified version of: connect-injector
 * https://github.com/daff/connect-injector
 *
 * Copyright (c) 2013 David Luecke
 * Licensed under the MIT license.
 */

var Buffer = require('buffer').Buffer;
var _ = require('underscore');
var async = require('async');
var WritableStream = require('stream-buffers').WritableStreamBuffer;
module.exports = function(when, converter) {
	return function (req, res, next) {
		// Allows more than one injector
		if(res.injectors) {
			res.injectors.push({
				when: when,
				converter: converter
			});
			return next();
		}

		var mixin = {
			injectors: [{
				when: when,
				converter: converter
			}],
			old: {
				write: res.write,
				end: res.end,
				writeHead: res.writeHead
			},
			_interceptCheck: function() {
				var self = this;
				if (typeof this._isIntercepted === 'undefined') {
					_.each(res.injectors, function(obj) {
						if(obj.when(req, res)) {
							self._isIntercepted = true;
							obj.active = true;
						}
					});

					if(!this._isIntercepted) {
						this._isIntercepted = false;
					}
				}
				return this._isIntercepted;
			},
			write: function (chunk) {
				if(this._interceptCheck()) {
					this._interceptBuffer || (this._interceptBuffer = new WritableStream());
					this._interceptBuffer.write(chunk);
					return true;
				}

				return this.old.write.apply(this, arguments);
			},
			end: function (data) {
				var self = this;
				if(data) {
					this.write(data);
				}

				if(!this._isIntercepted) {
					return this.old.end.apply(this);
				}

				var converters = _.map(_.filter(this.injectors, function(obj) {
					return obj.active;
				}), function(obj) {
					var converter = obj.converter;
					return function(buf, callback) {
						converter.call(self, callback, buf, req, res);
					}
				});

				var converterChain = async.compose.apply(async, converters.reverse());
				converterChain(this._interceptBuffer.getContents(), function(error, data) {
					if(error) {
						return next(error);
					}
					self.setHeader('Content-Length', data.length);
					self.old.end.call(self, data);
				});
				return true;
			}
		};

		_.extend(res, mixin);

		return next();
	}
}
