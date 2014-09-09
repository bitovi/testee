'use strict';

var _ = require('lodash');
var url = require('url');
var istanbul = require('istanbul');
var instrumenter = new istanbul.Instrumenter();
var injector = require('connect-injector');

module.exports = function(config) {
  var ignores = config.ignore || [];

  return injector(function (req, res) {
    var isIgnored = _.some(ignores, function (pattern) {
      var regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
      return regex.test(req.url);
    });
    return (res.getHeader('content-type').indexOf('application/javascript') === 0 ||
      res.getHeader('content-type').indexOf('application/x-javascript') === 0) &&
      !isIgnored;
  }, function (data, req, res, callback) {
    var path = url.parse(req.url).pathname;
    instrumenter.instrument(data.toString(), path, callback);
  });
};
