var _ = require('lodash');
var url = require('url');

exports.makeUrl = function(base, path, params) {
  var parsed = url.parse(path, true);
  var urlData = url.parse(base, true);

  path = parsed.pathname;

  urlData.query = _.extend(urlData.query || {}, parsed.query, params);
  urlData.pathname = path;

  return url.format(_.omit(urlData, 'search'));
};
