var _ = require('lodash');
var Q = require('q');
var useragent = require('useragent');

function Runner(options) {
  this.options = options;
}

_.extend(Runner.prototype, {
  shutdown: function() {
    if(this.tunnel && this.tunnel.process) {
      this.tunnel.process.kill();
    }

    if(this.server) {
      this.server.close();
    }

    if(this.reporter) {
      this.reporter.end();
    }
  },

  testOne: function(file, browser) {
    var self = this;
    var url = this.tunnel.makeUrl(file);

    return Q.nfcall(this.launcher, url, browser).then(function(instance) {
      var testRuns = self.api.lookup('runs');
      var handler = function(data) {
        if(data.status === 'finished' ) {
          instance.stop();
        }
        testRuns.removeListener('patched', handler);
      };

      testRuns.on('patched', handler);
    });
  },

  test: function(files, browsers) {

  }
});

module.exports = Runner;
