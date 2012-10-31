# Testee

Cross browser test reporting that will make you less testy.

> npm install -g testee

`cd` into the main folder of your JavaScript project and point testee to your QUnit, Mocha or Jasmine
test HTML page:

> testee tests/qunit.html

## Testing

The default browser is [PhantomJS](http://phantomjs.org/), just make sure you have it installed anywhere
on your system.

To run with a different local browser (e.g. Firefox) use:

> testee --browser firefox qunit.html

Note that Testee will use (and close) any already running browser instances!

## CI integration

## GruntJS

## Browserstack and remote browsers

## Running tests programmatically
