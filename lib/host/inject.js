var injector = require('connect-injector');
var debug = require('debug')('testee:html-injector');
var path = require('path');
var url = require('url');
var mime = require('mime-types');

function includes(str, search) {
  return str.indexOf(search) != -1;
}

function ensureDoctype(html) {
  var hasDoctype = includes(html, '<!doctype') || includes(html, '<!DOCTYPE');
  if (hasDoctype) {
    return html;
  }

  console.warn('Doctype not found; prepending "<!doctype html>" to prevent quirksmode problems');
  return '<!doctype html>' + html;
}

function injectScript(html, scriptUrl) {
  if (includes(html, scriptUrl)) {
    console.warn('Script "' + scriptUrl + '" will be auto-injected; please do not include it yourself');
    return html;
  }

  var script = '<script type="text/javascript" src="' + scriptUrl + '"></script>';

  var hasBodyEnd = includes(html, '</body>');
  if (hasBodyEnd) {
    return html.replace('</body>', script + '</body>');
  }

  return html + script;
}

function buildScriptUrl(config) {
  return config.adapter + 'testee.min.js';
}

// Returns a middleware that injects the SocketIO JavaScript
// and a link to the clients side adapters into any HTML file
module.exports = function (configuration) {
  return injector(function (req, res) {
    var header = res.getHeader('content-type') || mime.contentType(path.extname(url.parse(req.url).pathname));
    if (res._header) {
      var matches = res._header.match(/content-type:[\s*](.*)/i);
      header = matches && matches[1];
    }
    return header && (header.indexOf('text/html') === 0);
  }, function (data, req, res, callback) {
    debug('injecting scripts into file', req.url);
    var html = data.toString();
    html = ensureDoctype(html);
    html = injectScript(html, buildScriptUrl(configuration));
    callback(null, html);
  });
};

// for testing
module.exports._testing = {
  includes: includes,
  ensureDoctype: ensureDoctype,
  injectScript: injectScript,
  buildScriptUrl: buildScriptUrl
};
