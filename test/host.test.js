var assert = require('assert');
var inject = require('../lib/host/inject');

describe('inject.js', function () {
    var testing = inject._testing;
    var ensureDoctype = testing.ensureDoctype;
    var injectScript = testing.injectScript;

    describe('ensureDoctype()', function () {
        it('should prepend a doctype if not included in the html', function () {
            var html = 'This is fine.';
            assert.equal(
                ensureDoctype(html),
                '<!doctype html>This is fine.'
            );
        });

        it('should not modify an existing doctype', function () {
            var lowerHtml = '<!doctype transitional>';
            var upperHtml = '<!DOCTYPE super-strict>';
            assert.equal(ensureDoctype(lowerHtml), lowerHtml);
            assert.equal(ensureDoctype(upperHtml), upperHtml);
        });
    });

    describe('injectScript()', function () {
        it('should append scripts when there is no body tag', function () {
            var html = 'The text file thing';
            var scriptSrc = 'foo.js';
            var scriptTag = '<script type="text/javascript" src="' + scriptSrc + '"></script>';
            assert.equal(injectScript(html, 'foo.js'), html + scriptTag);
        });

        it('should place scripts right before the closing body tag', function () {
            var html = '<body>The text file thing</body>';
            var scriptSrc = 'foo.js';
            var scriptTag = '<script type="text/javascript" src="' + scriptSrc + '"></script>';
            assert.equal(
                injectScript(html, 'foo.js'),
                '<body>The text file thing' + scriptTag + '</body>'
            );
        });
    });
});