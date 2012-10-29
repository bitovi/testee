describe('Blog post test', function () {
	it('Should be published at the current time', function () {
		var now = new Date(),
			post = new BlogPost('Hello', 'Hello world');
		expect(post.date.getTime()).toBe(now.getTime());
	});

	it('Should throw an exception', function () {
		var post = new BlogPost('Hello', 'Hello world');
		expect(post.toString).toThrow("This blog post is not published");
	});

	it('Generates some neat HTML', function () {
		var now = new Date(),
			newpost = new BlogPost('Hello', 'Hello world'),
			publishedPost;

		// Man is asynchronous testing in Jasmine ever awkward.
		// Please tell me I am doing this wrong!

		runs(function () {
			newpost.publish(function (post) {
				publishedPost = post;
			});
		});

		waitsFor(function () {
			return !!publishedPost;
		}, 'Timed out', 1000);

		runs(function () {
			expect(publishedPost.toString()).toBe("<h1>Hello</h1>" +
				"<h6>Published on " + now.toString() + "</h6>" +
				"<p>Hello world</p>");
		});
	});

	it('Fails epicly', function() {
		expect(true).toBe(false);
	});
});