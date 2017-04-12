'use strict';

var _ = require('lodash');
var debug = require('debug')('testee:coverage');
var url = require('url');
var injector = require('connect-injector');
var path = require('path');
var mime = require('mime-types');

var babel = require('babel-core');

// Returns a middleware that instruments JavaScript files for code coverage
module.exports = function(config) {
  var ignores = config.ignore || [];

  return injector(function (req, res) {
    var isIgnored = _.some(ignores, function (pattern) {
      // Ignored string will be converted to a regular expression
      var regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
      return regex.test(req.url);
    });
    var contentType = res.getHeader('content-type') || mime.contentType(path.extname(url.parse(req.url).pathname));

    return contentType && (contentType.indexOf('application/javascript') === 0 ||
      contentType.indexOf('application/x-javascript') === 0) &&
      !isIgnored;
  }, function (data, req, res, callback) {
    var filename = url.parse(req.url).pathname;
    debug('instrumenting js file for code coverage', filename);
    // Instrument the file using Istanbul
    // instrumenter.instrument(data.toString(), path, callback);
    var result = babel.transform(data.toString(), {
      filename: filename,
      plugins: [
        require('babel-plugin-istanbul').default
      ]
    });
    callback(null, result.code);
  });
};
