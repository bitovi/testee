"use strict";

var path = require('path');
var fs = require('fs');
var url = require('url');
var _ = require('underscore');
var zlib = require('zlib');
var winston = require('winston');
var logger = null;

var getToken = function() {
	return Math.random().toString(28).substring(2, 8);
};

exports.parseUrl = function() {
	return url.parse.apply(this, arguments);
}

exports.getRoot = function(filename, root) {
	var parsed = url.parse(filename);
	if(root) {
		parsed = url.parse(root);
		// If we don't have a protocol we need the real path
		if(!parsed.protocol) {
			return url.parse(fs.realpathSync(root));
		}
		return parsed;
	}
	if(!parsed.protocol) {
		return url.parse(process.cwd());
	}
	return parsed;
}

exports.generateToken = function(tokens) {
	var token = getToken();
	while(tokens && tokens.indexOf(token) !== -1) {
		token = getToken();
	}
	return token;
};

exports.getUrl = function(hostUrl, filename, params) {
	var fullPath = hostUrl + path.normalize('/' + filename);
	var urlData = url.parse(fullPath, true);
	return url.format(_.extend(_.pick(urlData, 'protocol', 'host', 'port'), {
		query : _.extend({}, urlData.query, params),
		pathname : urlData.pathname
	}));
};

exports.getLogger = function() {
	if(logger === null) {
		logger = winston;
		logger.remove(winston.transports.Console);
		logger.add(winston.transports.Console, {
			level : 'error',
			colorize : true
		});
	}

	return logger;
};

exports.parseBrowser = function(str) {
	var parts = str.split(/:|@/);
	var result = { browser : parts[0] };
	if(parts[1]) {
		result.version = parts[1];
	}
	if(parts[2]) {
		result.os = parts[2];
	}
	return result;
};

exports.unzip = function(res, data, callback) {
	// Unzip gzipped content
	if(res.getHeader('content-encoding') === 'gzip') {
		res.removeHeader('content-encoding');
		return zlib.gunzip(data, callback);
	}

	return callback(null, data);
};
