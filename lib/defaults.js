var _ = require('lodash');

module.exports = function(options) {
  options = options || {};

  if(typeof options.then === 'function') {
    return options;
  }

  var opts = _.defaults({}, options, {
    port: 3996,
    root: process.cwd(),
    reporter: 'Dot',
    adapter: '/testee/',
    timeout: 120,
    delay: 1000
  });

  if(!opts.tunnel) {
    opts.tunnel = {
      type: 'local'
    };
  }

  opts.tunnel.port = opts.port;

  if(!opts.launch) {
    opts.launch = {
      type: 'local'
    };
  }

  return opts;
};
