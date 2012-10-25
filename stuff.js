var _ = require('underscore');
var url = require('url');

var getUrl = function(hostUrl, fileName) {
	console.log(fileName);
	var params = {};
	var urlData = url.parse(hostUrl);
	console.log(urlData);
	params['__token'] = Math.random().toString(28).substring(10);
	return url.format({
		protocol : urlData.protocol,
		host : urlData.host,
		port : urlData.port,
		query : params,
		pathname : '/' + fileName
	});
}

console.log(getUrl('http://pagekite.me', 'qunit.html'));
