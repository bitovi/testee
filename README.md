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

Note that if you try to test a local browser that is already running you will get an error message.

### Launching browsers

[Launchpad](https://github.com/ekryski/launchpad) is the browser launcher used by Testee.

### Localhost tunneling

Testee uses the [miner] package to provide localhost tunelling.

## CI integration

## Browserstack and remote browsers

## GruntJS

## Running tests programmatically

It is just as simple to run tests programmatically with NodeJS:

    var testee = require('testee');
    testee.test(files, params, function (err, results) {
      process.exit();
    });