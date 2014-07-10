var util = require('util');
var EventEmitter = require('events').EventEmitter;

// A class that takes a given target event emitter and allows
// to buffer events when paused (all events will be sent to the
// original event emitter in the order they came in when calling `.start`).
// This is used to properly report multiple tests coming in at the same time.
function EventBuffer(target) {
  this.target = target;
  this._buffer = [];
  this._paused = true;
}

util.inherits(EventBuffer, EventEmitter);

EventBuffer.prototype.flush = function () {
  while (this._buffer.length) {
    this._emit(this._buffer.shift());
  }
  this._paused = false;
};

EventBuffer.prototype.emit = function () {
  this._push(arguments);
  return EventEmitter.prototype.emit.apply(this, arguments);
};

EventBuffer.prototype.buffer = function () {
  this._paused = true;
};

EventBuffer.prototype._emit = function(args) {
  this.target.emit.apply(this.target, args);
};

EventBuffer.prototype._push = function (args) {
  if (!this._paused) {
    this._emit(args);
  } else {
    this._buffer.push(args);
  }
};

module.exports = EventBuffer;
