var _ = require('lodash');
var EventBuffer = require('./event');

// Keeps track of all event buffers and retrieves the right one
function BufferManager(runner) {
  this.runner = runner;
  this.buffers = [];
  this.cache = {};
}

// Add data to the cache (indexed by `.id`)
BufferManager.prototype.updateCache = function(data) {
  this.cache[data.id] = data;
};

// Returns the id of the root run for a given GUID
BufferManager.prototype.rootId = function(id) {
  var current = this.cache[id];

  if(!current || !current.parent) {
    return id;
  }

  // Move up the parents
  while(current.parent) {
    current = this.cache[current.parent];
  }
  return current.id;
};

// Adds and initializes a new event buffer for a given id
BufferManager.prototype.add = function(id) {
  var buffer = new EventBuffer(this.runner);
  var buffers = this.buffers;
  var nextBuffer = function() {
    buffers.shift();
    if(buffers.length) {
      var next = _.first(buffers);
      // Move on to the next one
      next.once('done', nextBuffer);
      next.flush();
    }
  };

  buffer.id = id;

  // If there aren't any other buffers start emitting events right away
  if(!buffers.length) {
    buffer.flush();
    // When this one is done, move to the next
    buffer.once('done', nextBuffer);
  }

  buffers.push(buffer);

  return this.get(id);
};

// Get the event buffer by id (using the cache root id)
BufferManager.prototype.get = function(id) {
  var root = this.rootId(id);
  return _.find(this.buffers, function(buffer) {
    return buffer.id === root;
  });
};

module.exports = BufferManager;
