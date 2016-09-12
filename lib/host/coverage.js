'use strict';

var _ = require('lodash');
var debug = require('debug')('testee:coverage');
var url = require('url');
var instrument = require('istanbul-lib-instrument');
var injector = require('connect-injector');
var path = require('path');
var mime = require('mime-types');

// Returns a middleware that instruments JavaScript files for code coverage
module.exports = function(config) {
  var defaultIgnores = [ 'node_modules/' ];
  var ignores = (config && config.ignore) || defaultIgnores;

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
    var path = url.parse(req.url).pathname;
    var instrumenter = instrument.createInstrumenter({ esModules: true });

    debug('instrumenting js file for code coverage', path);
    console.log('!! instrumenting', path);
    // Instrument the file using Istanbul
    instrumenter.instrument(data.toString(), path, function() {
      console.log('GOT', arguments);
    });
    instrumenter.instrument(data.toString(), path, callback);
  });
};
