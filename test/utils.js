/*global describe, it*/
"use strict";

var expect = require('expect.js');
var fs = require('fs');
var utils = require('../lib/utils');

describe("Utilities", function() {
	it("getRoot", function() {
		var root = utils.getRoot('http://localhost:3996/test/qunit.html');
		expect(root.hostname).to.be('localhost')
		expect(root.port).to.be('3996');
		expect(root.path).to.be('/test/qunit.html');

		root = utils.getRoot('client/examples/test.html');
		expect(root.path).to.be(fs.realpathSync(__dirname + '/../'));

		root = utils.getRoot('test.html', 'test');
		expect(root.path).to.be(__dirname);

		root = utils.getRoot('test.html', '.');
		expect(root.path).to.be(fs.realpathSync(__dirname + '/../'));

		root = utils.getRoot('test.html', 'http://test.com:8998')
		expect(root.hostname).to.be('test.com')
		expect(root.port).to.be('8998');
	});

	it("generateToken", function() {
		for(var i = 0; i < 25; i++) {
			expect(utils.generateToken().length).to.be(6);
		}
	});

	it("getUrl", function() {
		var url = utils.getUrl('http://localhost', 'qunit.html');
		expect(url).to.be('http://localhost/qunit.html');

		url = utils.getUrl('http://localhost:3996', 'test/../qunit.html');
		expect(url).to.be('http://localhost:3996/qunit.html');

		url = utils.getUrl('http://localhost:3996', 'test/../qunit.html?x=z');
		expect(url).to.be('http://localhost:3996/qunit.html?x=z');

		url = utils.getUrl('https://localhost', 'test/qunit.html', { token : 'testing' });
		expect(url).to.be('https://localhost/test/qunit.html?token=testing');
	});

	it("parseBrowser", function() {
		var browser = utils.parseBrowser('ie');
		expect(browser).to.eql({
			browser : 'ie'
		});
		browser = utils.parseBrowser('firefox:15.0');
		expect(browser).to.eql({
			browser : 'firefox',
			version : '15.0'
		});
		browser = utils.parseBrowser('safari:5.0.1@mac');
		expect(browser).to.eql({
			browser : 'safari',
			version : '5.0.1',
			os : 'mac'
		});
	});
});