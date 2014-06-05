'use strict';

// TODO eventually swap this out for the actual https://github.com/feathersjs/feathers-memory
var Proto = require('uberproto');
var _ = require('lodash');

// TODO (EK): Should we allow the ability to specify ascending
// or descending order for sort and/or order functions? Should
// you be able to sort by multiple attributes?
//
// ie. { sort: ['name', 'birthday'], order: 'ascending'}
var filters = {
  sort: function (values, param) {
    return _.sortBy(values, function (item) {
      return item[param];
    });
  },
  order: function (values) {
    return values.reverse();
  },
  skip: function (values, param) {
    return values.slice(param);
  },
  limit: function (values, param) {
    return values.slice(0, param);
  }
};

var MemoryService = Proto.extend({
  init: function (options) {
    options = options || {};

    this.type = 'memory';
    this._id = options.idField || 'id';
    this._uId = options.startId || 0;
    this.store = options.store || {};
  },

  find: function (params, cb) {
    if (_.isFunction(params)){
      cb = params;
      params = {};
    }

    params.query = params.query || {};

    var values = _.values(this.store);

    _.each(filters, function(handler, name) {
      values = params.query[name] ? handler(values, params.query[name]) : values;
    });

    cb(null, values);
  },

  // TODO: This should support more than id
  get: function (id, params, cb) {
    if (_.isFunction(params)){
      cb = params;
      params = {};
    }

    if (id in this.store) {
      return cb(null, this.store[id]);
    }
    cb(new Error('Could not find record', { id: id }));
  },

  create: function (data, params, cb) {
    if (_.isFunction(params)){
      cb = params;
    }

    var id = data[this._id] || this._uId++;
    data[this._id] = id;

    if (this.store[id]){
      return cb(new Error('A record with id: ' + id + ' already exists'));
    }

    this.store[id] = data;

    cb(null, data);
  },

  update: function (id, data, params, cb) {
    if (_.isFunction(params)){
      cb = params;
    }

    if (id in this.store) {
      this.store[id] = data;

      return cb(null, this.store[id]);
    }

    cb(new Error('Could not find record', { id: id }));
  },

  patch: function(id, data, params, cb) {
    if (_.isFunction(params)){
      cb = params;
    }

    var self = this;
    if (id in this.store) {
      _.each(_.omit(data, this._id), function(value, key){
        self.store[id][key] = value;
      });

      return cb(null, this.store[id]);
    }

    cb(new Error('Could not find record', { id: id }));
  },

  remove: function (id, params, cb) {
    if (_.isFunction(params)){
      cb = params;
    }

    if (id in this.store) {
      var deleted = this.store[id];
      delete this.store[id];

      return cb(null, deleted);
    }

    cb(new Error('Could not find record', { id: id }));
  }
});

module.exports = function(options) {
  return Proto.create.call(MemoryService, options);
};

module.exports.Service = MemoryService;