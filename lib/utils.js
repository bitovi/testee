var path = require('path');
var fs = require('fs');
var url = require('url');
var _ = require('underscore');
var winston = require('winston');
var logger = null;

var getToken = function() {
	return Math.random().toString(28).substring(2, 8);
}

exports.generateToken = function(tokens) {
	var token = getToken();
	while(tokens && tokens.indexOf(token) !== -1) {
		token = getToken();
	}
	return token;
}

exports.validateFilename = function(root, fileName) {
	var relative = path.relative(root, path.join(root, fileName));
	return relative.indexOf('..') !== 0 || relative.indexOf('../') !== 0;
}

exports.getUrl = function(hostUrl, filename, params) {
	var urlData = url.parse(hostUrl, true);
	return url.format(_.extend(_.pick(urlData, 'protocol', 'host', 'port'), {
		query : _.extend({}, urlData.params, params),
		pathname : path.normalize('/' + filename)
	}));
}

exports.getLogger = function() {
	if(logger === null) {
		logger = new (winston.Logger)({
			transports: []
		});
	}

	return logger;
}