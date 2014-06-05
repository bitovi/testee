"use strict";
var zlib = require('zlib');

exports.unzip = function(res, data, callback) {
	// Unzip gzipped content
	if(res.getHeader('content-encoding') === 'gzip') {
		res.removeHeader('content-encoding');
		return zlib.gunzip(data, callback);
	}

	return callback(null, data);
};
