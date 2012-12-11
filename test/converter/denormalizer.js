/*global describe, it*/
"use strict";

var expect = require('expect.js');
var Denormalizer = require('../../lib/converter/denormalizer');

describe("Denormalizer", function() {
	it("converts data, adds fullTitle", function() {
		var d = new Denormalizer();
		var result = d.convert({
			id : 0,
			title : 'The title'
		});
		expect(result.length).to.be(1);
		expect(result[0].id).to.be(0);
		expect(result[0].fullTitle).to.be.a(Function);
		expect(result[0].fullTitle()).to.be('The title');
	});

	it("converts data, adds prefix, sets defaults", function() {
		var d = new Denormalizer();
		var result = d.convert({
			id : 0
		}, {
			title : 'The default title'
		}, 'test');
		expect(d.objects).to.have.property('test:0');
		expect(result.length).to.be(1);
		expect(result[0].id).to.be(0);
		expect(result[0].title).to.be('The default title');
	});

	it("converts data, adds prefix, sets parent, returns fullTitle", function() {
		var d = new Denormalizer(' || ');
		var result = d.convert({
			id : 0
		}, {
			title : 'The default title'
		}, 'test')[0];
		expect(d.objects).to.have.property('test:0');
		expect(result.title).to.be('The default title');

		result = d.convert({
			id : 1,
			parent : 0
		}, {
			title : 'Default title 2'
		}, 'test')[0];
		expect(d.objects).to.have.property('test:1');
		expect(result.parent).to.be(d.objects['test:0']);
		expect(result.fullTitle()).to.be('The default title || Default title 2');
	});

	it("converts errors", function() {
		var d = new Denormalizer(' || ');
		var result = d.convert({
			id : 0,
			err : {
				message : 'This is the error',
				stack : 'This is the error stack'
			}
		}, {
			title : 'The default title'
		}, 'test');
		expect(result.length).to.be(2);
		expect(result[1]).to.be.a(Error);
		expect(result[1].message).to.be('This is the error');
		expect(result[1].stack).to.be('This is the error stack');
	});
});