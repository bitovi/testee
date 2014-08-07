var _ = require('lodash');
var url = require('url');
var getToken = function() {
  return Math.random().toString(28).substring(2, 8);
};
var tokens = [];

exports.makeUrl = function(base, path, params) {
  var parsed = url.parse(path, true);
  var urlData = url.parse(base, true);

  path = parsed.pathname;

  urlData.query = _.extend(urlData.query || {}, parsed.query, params);
  urlData.pathname = path;

  return url.format(_.omit(urlData, 'search'));
};

exports.generateToken = function() {
  var token = getToken();
  while(tokens && tokens.indexOf(token) !== -1) {
    token = getToken();
  }
  tokens.push(token);
  return token;
};
