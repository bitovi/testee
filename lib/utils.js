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

// Simple JavaScript GUID
// See http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
exports.guid = function() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
};
