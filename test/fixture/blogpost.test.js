var assert = require('assert');

var BlogPost = function(title, content, date) {
  this.title = title;
  this.content = content.replace(/n/g, "<br />");
  this.date = date || new Date();
  this.published = false;
};

BlogPost.prototype.publish = function(callback) {
  var self = this;
  setTimeout(function() {
    self.published = true;
    callback(self);
  }, 200);
};

BlogPost.prototype.toString = function() {
  if(!this.published) {
    throw "This blog post is not published";
  }
  return "<h1>" + this.title + "</h1>" +
    "<h6>Published on " + this.date.toString() + "</h6>" +
    "<p>" + this.content + "</p>";
};

it('Should be published at the current time', function() {
  var now = new Date(),
    post = new BlogPost('Hello', 'Hello world');
  assert.equal(post.date.getTime(), now.getTime());
});

describe('BlogPost test', function() {
  it('Should throw an exception', function() {
    var post = new BlogPost('Hello', 'Hello world');
    try {
      post.toString();
      assert.ok(false);
    }
    catch(e) {
      assert.equal(e, "This blog post is not published");
    }
  });

  it('Generates some neat HTML', function(done) {
    var now = new Date(),
      newpost = new BlogPost('Hello', 'Hello world');
    newpost.publish(function(post) {
      assert.equal(post.toString(), "<h1>Hello</h1>" +
        "<h6>Published on " + now.toString() + "</h6>" +
        "<p>Hello world</p>");
      done();
    });
  });

  it('Sadly is skipped');

  it('Fails epicly', function() {
    assert.ok(false);
  });

});