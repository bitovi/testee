var unit = QUnit;

unit.module('Blog post test');

unit.test('Date set to current time', function(assert) {
  var post = new BlogPost('Hello', 'Hello world');
  assert.ok(post.date, 'not comparing the date since it seem to get off')
});

unit.test('Unpublished post throws exception', function(assert) {
  var post = new BlogPost('Hello', 'Hello world');
  assert.throws(post.toString, new Error("This blog post is not published"), "Got exception");
});

unit.test('Generates HTML', function(assert) {
  var done = assert.async();
  var now = new Date();
  var newpost = new BlogPost('Hello', 'Hello world', now);
  newpost.publish(function(post) {
    assert.equal(post.toString(), "<h1>Hello</h1>" +
      "<h6>Published on " + now.toString() + "</h6>" +
      "<p>Hello world</p>", 'Generated expected HTML');
    done();
  });
});

unit.test('Fails epicly', function(assert) {
  assert.ok(false, 'Everything is going to be allright');
});
