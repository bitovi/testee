var assert = require('assert');
var EventEmitter = require('events').EventEmitter;
var EventBuffer = require('../../../lib/reporter/buffer/event');

describe('EventBuffer test', function() {
  var first = { message: 'First event' };
  var second = { message: 'Second event' };
  var third = { message: 'Third event' };

  it('passes events through the buffer event emitter', function(done) {
    var target = new EventEmitter();
    var buffer = new EventBuffer(target);

    buffer.on('first', function(data) {
      assert.deepEqual(first, data, 'Event passed through');
    });

    buffer.on('second', function(data) {
      assert.deepEqual(second, data, 'Event passed through');
      done();
    });

    buffer.emit('first', first);
    buffer.emit('second', second);
  });

  it('Is buffering by default and flushes events to the original emitter', function(done) {
    var target = new EventEmitter();
    var buffer = new EventBuffer(target);

    buffer.emit('first', first);
    buffer.emit('second', second);

    target.on('first', function(data) {
      assert.deepEqual(first, data, 'Event sent to target after calling .flush');
    });

    target.on('second', function(data) {
      assert.deepEqual(second, data, 'Event sent to target after calling .flush');
      done();
    });

    buffer.flush();
  });

  it('After flushing, all events get passed and can return back to buffering', function(done) {
    var target = new EventEmitter();
    var buffer = new EventBuffer(target);

    buffer.emit('first', first);

    target.on('first', function(data) {
      assert.deepEqual(first, data, 'Event sent to target after calling .flush');
    });

    buffer.flush();

    target.on('second', function(data) {
      assert.deepEqual(second, data, 'Event sent to target after calling .flush');
    });

    buffer.emit('second', second);
    buffer.buffer();

    buffer.emit('third', third);
    target.on('third', function(data) {
      assert.deepEqual(third, data, 'Event sent to target after calling .flush');
      done();
    });

    buffer.flush();
  });
});
