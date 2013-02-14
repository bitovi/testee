"use strict";

var path = require('path');
var fs = require('fs');
var url = require('url');
var _ = require('underscore');
var winston = require('winston');
var logger = null;
var urlCheck = new RegExp('(http|ftp|https)://[a-z0-9\-_]+(\.[a-z0-9\-_]+)+([a-z0-9\-\.,@\?^=%&;:/~\+#]*[a-z0-9\-@\?^=%&;/~\+#])?', 'i');

var getToken = function() {
	return Math.random().toString(28).substring(2, 8);
};

exports.isUrl = function(url) {
	return urlCheck.test(url);
}

exports.generateToken = function(tokens) {
	var token = getToken();
	while(tokens && tokens.indexOf(token) !== -1) {
		token = getToken();
	}
	return token;
};

exports.validateFilename = function(root, fileName) {
	var fullName = path.join(root, fileName);
	var relative = path.relative(root, fullName);
	return relative.indexOf('..') !== 0 && fs.existsSync(fullName);
};

exports.getUrl = function(hostUrl, filename, params) {
	var urlData = url.parse(hostUrl, true);
	return url.format(_.extend(_.pick(urlData, 'protocol', 'host', 'port'), {
		query : _.extend({}, urlData.params, params),
		pathname : path.normalize('/' + filename)
	}));
};

exports.getLogger = function() {
	if(logger === null) {
		logger = winston;
		logger.remove(winston.transports.Console);
		logger.add(winston.transports.Console, {
			level : 'error',
			colorize : true,
			handleExceptions : true
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