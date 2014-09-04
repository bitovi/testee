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

// Simple JavaScript GUID
// See http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
exports.guid = function() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
};
