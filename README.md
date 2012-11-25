# Testee

Cross browser test reporting that will make you less cranky.

> npm install -g testee

`cd` into the main folder of your JavaScript project and point testee to your QUnit, Mocha or Jasmine
test HTML page:

> testee tests/qunit.html

## Testing

The default browser is [PhantomJS](http://phantomjs.org/), just make sure you have it installed anywhere
on your system.

To run with a different local browser (e.g. Firefox) use:

> testee test/qunit.html --browser firefox

Note that Testee will use (and close) any already running browser instances!

### Launching browsers

[Launchpad]()

### Localhost tunneling

Testee uses the [miner] package to provide localhost tunelling.

## CI integration

## Browserstack and remote browsers

## GruntJS

## Running tests programmatically
