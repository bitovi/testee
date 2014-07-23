var assert = require('assert');
var utils = require('../lib/utils');

describe('Utils test', function() {
  it('.makeUrl', function() {
    assert.equal(utils.makeUrl('http://localhost:8080', 'test'), 'http://localhost:8080/test');

    assert.equal(utils.makeUrl('http://localhost:8080', 'http://examples.com/my/test'),
      'http://localhost:8080/my/test');

    assert.equal(utils.makeUrl('http://localhost:8080', 'my/test', { some: 'thing', test: 2 }),
      'http://localhost:8080/my/test?some=thing&test=2');

    assert.equal(utils.makeUrl('http://localhost:8080', 'my/test?test=value', { some: 'thing' }),
      'http://localhost:8080/my/test?test=value&some=thing');

    assert.equal(utils.makeUrl('http://localhost:8080?last=test', 'my/test?test=value', { some: 'thing' }),
      'http://localhost:8080/my/test?last=test&test=value&some=thing');
  });
});
