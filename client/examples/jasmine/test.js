describe('Blog post test', function () {

    describe('Nested describe', function () {
        it("should pass this test", function () {
            expect(true).toBeTruthy();
        });

        it("should also pass this test", function () {
            expect(true).toBeTruthy();
        });
    });

    describe('Second nested describe', function () {
        xit("should add numbers correctly", function () {
            expect(2 + 2).toEqual(4);
        });

        describe('We need to go deeper', function () {
            xit("should've been a better movie", function () {
                expect('Leo').toEqual('a good actor');
            });
        });
    });

    describe('Second nested describe with xits', function () {
        xit("should add numbers correctly", function () {
            expect(2 + 2).toEqual(4);
        });

        describe('We need to go deeper', function () {
            xit("should've been a better movie", function () {
                expect('Leo').toEqual('a good actor');
            });
        });
    });

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