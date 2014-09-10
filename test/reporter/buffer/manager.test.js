var assert = require('assert');
var EventEmitter = require('events').EventEmitter;
var BufferManager = require('../../../lib/reporter/buffer/manager');

describe('BufferManager test', function() {
  var first = {
    id: 1,
    name: 'first'
  };
  var second = {
    id: 2,
    parent: 1,
    name: 'second'
  };
  var third = {
    id: 3,
    parent: 2,
    name: 'third'
  };

  it('initializes updates the cache and gets the root id', function() {
    var buffers = new BufferManager();

    buffers.updateCache(first);
    buffers.updateCache(second);
    buffers.updateCache(third);

    assert.equal(Object.keys(buffers.cache).length, 3, 'Three items in cache');
    assert.equal(buffers.rootId(1), 1, 'Got root id from root');
    assert.equal(buffers.rootId(3), 1, 'Got root id for child');
  });

  it('adds a new buffer and flushes to runner right away', function(done) {
    var runner = new EventEmitter();
    var manager = new BufferManager(runner);

    manager.updateCache(first);

    manager.add(1);

    assert.equal(manager.buffers.length, 1, 'Registered one event buffer');

    runner.on('ev', function(data) {
      assert.deepEqual(data, first, 'Data got flushed to runner right away');
      done();
    });
    manager.get(1).emit('ev', first);
  });

  it('two buffer events are chained', function(done) {
    var runner = new EventEmitter();
    var manager = new BufferManager(runner);

    manager.add(1);
    manager.add(2);

    runner.on('ev', function(data) {
      assert.deepEqual(data, first, 'Got correct data for first event');

      runner.on('cached', function(data) {
        assert.deepEqual(data, second, 'Got correct data for second event');
        done();
      });

      manager.get(1).emit('done');
    });

    manager.get(2).emit('cached', second);
    manager.get(1).emit('ev', first);
  });
});
