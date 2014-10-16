'use strict';

var _ = require('lodash');
var debug = require('debug')('testee:coverage');
var url = require('url');
var istanbul = require('istanbul');
var instrumenter = new istanbul.Instrumenter();
var injector = require('connect-injector');

// Returns a middleware that instruments JavaScript files for code coverage
module.exports = function(config) {
  var ignores = config.ignore || [];

  return injector(function (req, res) {
    var isIgnored = _.some(ignores, function (pattern) {
      // Ignored string will be converted to a regular expression
      var regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
      return regex.test(req.url);
    });
    var contentType = res.getHeader('content-type');

    return contentType && (contentType.indexOf('application/javascript') === 0 ||
      contentType.indexOf('application/x-javascript') === 0) &&
      !isIgnored;
  }, function (data, req, res, callback) {
    var path = url.parse(req.url).pathname;
    debug('instrumenting js file for code coverage', path);
    // Instrument the file using Istanbul
    instrumenter.instrument(data.toString(), path, callback);
  });
};
