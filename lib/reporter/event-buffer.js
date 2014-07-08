var util = require('util');
var EventEmitter = require('events').EventEmitter;

function EventBuffer(source) {
  var old = source.emit;
  var self = this;

  source.emit = function () {
    self._push(arguments);
    return old.apply(this, arguments);
  };

  this.source = source;
  this.buffer = [];
  this._paused = true;
}

util.inherits(EventBuffer, EventEmitter);

EventBuffer.prototype.start = function () {
  while (this.buffer.length) {
    this.emit.apply(this, this.buffer.shift());
  }
  this._paused = false;
  return this;
};

EventBuffer.prototype.pause = function () {
  this._paused = true;
  return this;
};

EventBuffer.prototype._push = function (args) {
  if (!this._paused) {
    this.emit.apply(this, args);
  } else {
    this.buffer.push(args);
  }

  return this;
};

module.exports = EventBuffer;
