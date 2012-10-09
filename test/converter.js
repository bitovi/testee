var expect = require('expect.js');
var Converter = require('../lib/converter');
var EventEmitter = require('events').EventEmitter;

describe("Converter", function() {
	it("Passes events, extends existing", function(done) {
		var emitter = new EventEmitter();
		var converter = new Converter(emitter);
		converter.once('start', function(data) {
			expect(data.id).to.be(0);
			expect(data.fullTitle).to.be.an('function');
			expect(data.test).to.be('data');
		});
		emitter.emit('start', { id : 0, test : 'data' });
		converter.once('start', function(data) {
			expect(data.id).to.be(0);
			expect(data.test).to.be('data');
			expect(data.newProp).to.be.ok();
			done();
		});
		emitter.emit('start', { id : 0, newProp : true });
	});

	it("Sets defaults", function(done) {
		var emitter = new EventEmitter();
		var converter = new Converter(emitter);
		converter.once('pass', function(data) {
			expect(data).to.have.property('id', 0);
			Object.keys(Converter.prototype.defaults.pass).forEach(function(name) {
				expect(data).to.have.property(name, Converter.prototype.defaults.pass[name]);
			});
			done();
		});
		emitter.emit('pass', { id : 0 });
	});

	it("Sets parent, adds fullTitle()", function(done) {
		var emitter = new EventEmitter();
		var converter = new Converter(emitter);
		emitter.emit('suite', { id : 1, title : 'Test suite' });
		converter.once('test', function(data) {
			expect(data).to.have.property('id', 2);
			expect(data).to.have.property('parent');
			expect(data.parent.id).to.be(1);
			expect(data.fullTitle).to.be.a('function');
			expect(data.fullTitle()).to.be('Test suite Test 2');
			done();
		});
		emitter.emit('test', { id : 2, parent : 1, title : 'Test 2' });
	});

	it("Converts errors", function(done) {
		var emitter = new EventEmitter();
		var converter = new Converter(emitter);
		converter.on('fail', function(data, error) {
			expect(error).to.be.a(Error);
			expect(error.message).to.be('A failed test');
			expect(error.stack).to.be('Custom stack trace');
			done();
		});
		emitter.emit('fail', { id : 1, title : 'Failing test', err : {
				message : 'A failed test',
				stack : 'Custom stack trace'
			}
		});
	});
});