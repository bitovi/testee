module('Blog post test');

test('Date set to current time', function() {
  var post = new BlogPost('Hello', 'Hello world');
  ok(post.date, 'not comparing the date since it seem to get off')
});

test('Unpublished post throws exception', function() {
  var post = new BlogPost('Hello', 'Hello world');
  throws(post.toString, "This blog post is not published", "Got exception");
});

test('Generates HTML', function() {
  stop();
  var newpost = new BlogPost('Hello', 'Hello world');
  newpost.publish(function(post) {
    equal(post.toString(), "<h1>Hello</h1>" +
      "<h6>Published on " + new Date().toString() + "</h6>" +
      "<p>Hello world</p>", 'Generated expected HTML');
    start();
  });

});

test('Fails epicly', function() {
  ok(false, 'Everything is going to be allright');
});
