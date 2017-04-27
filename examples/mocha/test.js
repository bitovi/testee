describe('BlogPost test', function() {

	it('Should be published at the current time', () => {
		const now = new Date(),
			post = new BlogPost('Hello', 'Hello world', now);
		assert(post.date.getTime() == now.getTime());

		console.log('Hi there!');
	});

	it('Should throw an exception', function() {
		var post = new BlogPost('Hello', 'Hello world');
		try {
			post.toString();
			assert(false);
		}
		catch(e) {
			assert(true);
			assert(e.message === "This blog post is not published");
		}
	});

	it('Generates some neat HTML', function(done) {
		var now = new Date();
	  var newpost = new BlogPost('Hello', 'Hello world');

		newpost.publish(function(post) {
			assert(post.toString() == "<h1>Hello</h1>" +
				"<h6>Published on " + now.toString() + "</h6>" +
				"<p>Hello world</p>");
			done();
		});

		console.error('Blog post is', newpost);
	});

  it.skip('This is a skipped test', function() {

  });

	it('Fails epicly', function() {
		assert(false);
	});

});
