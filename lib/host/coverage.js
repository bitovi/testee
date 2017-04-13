'use strict';

var _ = require('lodash');
var debug = require('debug')('testee:coverage');
var url = require('url');
var injector = require('connect-injector');
var path = require('path');
var mime = require('mime-types');
var babel = require('babel-core');

function isRecognizedPath (ignores, url) {
  var isIgnored = _.some(ignores, function (pattern) {
    // Ignored string will be converted to a regular expression
    var regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
    return regex.test(url);
  });
  return !isIgnored;
}

function isRecognizedType (contentType) {
  return contentType && (contentType.indexOf('application/javascript') === 0 ||
    contentType.indexOf('application/x-javascript') === 0);
}

// Returns a middleware that instruments JavaScript files for code coverage
module.exports = function(config, root) {
  var ignores = config.ignore || [];

  return injector(function (req, res) {
    var isValidPath = isRecognizedPath(ignores, req.url);
    var contentType = res.getHeader('content-type') || mime.contentType(path.extname(url.parse(req.url).pathname));
    var isValidType = isRecognizedType(contentType);
    var shouldInstrument = isValidPath && isValidType;
    if (shouldInstrument) {
      debug('should instrument', req.url);
    }
    return shouldInstrument;
  }, function (data, req, res, callback) {
    var filename = url.parse(req.url).pathname;
    var filepath = path.join(root, filename.slice(1));
    var result = babel.transform(data.toString(), {
      filename: filepath,
      plugins: [
        require('babel-plugin-istanbul').default
      ]
    });
    debug('instrumented', filepath);
    callback(null, result.code);
  });
};
