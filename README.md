# Testee

Cross browser test reporting that will make you less cranky.

> npm install -g testee

`cd` into the main folder of your JavaScript project and point testee to your QUnit, Mocha or Jasmine
test HTML page:

> testee tests/qunit.html

## Command line testing

The default browser is [PhantomJS](http://phantomjs.org/), just make sure you have it installed anywhere
on your system.

To run with a different local browser (e.g. Firefox) use:

> testee test/qunit.html --browser firefox

Note that if you try to test a local browser that is already running you will get an error message.

### Command line options

The following options are available:

* `-h`, `--help`: output usage information
* `-V`, `--version`: output the version number
* `-b`, `--browser` `[name]`: The browser you want to run (default: `phantom`)
* `-l`, `--launch` `[name]`: The test environment you want to use. Currently supports `local`, `browserstack` or `remote` (default: `local`)
* `-t`, `--tunnel` `[name]`: The tunneling service provider to use. Currently supports local, localtunnel, browserstack and pagekite (default: `local`)
* `-p`, `--port` `[port]`: The port to run the server on (default: `3996`)
* `-r`, `--reporter` `[name]`: The name of the reporter to use (default: `Dot`)
* `-v`, `--verbose`: Writes a log file with debugging information
* `-l`, `--log` `[file]`: If in verbose mode, the name of the logfile to write to (default: `testee.log`)
* `-c`, `--config` `[file]`: Use this JSON configuration file (can be overwritten by command line options)
* `--timeout` `[seconds]`: The per test timeout (in seconds)

### Examples

### Command line Browserstack

### CI integration

## Configuration API

Besides the command line options you can also configure Testee through a JSON configuration file,
as a [GruntJS task]() or programatically as a NodeJS module. The configuration format is the same in
all three cases, available options are descibed below.

### Default configuration

Any options will be merged with the following default configuration:

```javascript
{
	launch : 'local', // local, remote, browserstack
	tunnel : 'local', // local, localtunnel, pagekite, browserstack
	browser : 'phantom',
	root : '.', // HTTP server root
	reporter : 'Spec',
	port : 3996,
	verbose : true,
	log : './testee.log',
	timeout : 120
}
```

### Launching browsers

[Launchpad](https://github.com/ekryski/launchpad) is the browser launcher used by Testee.

### Localhost tunneling

Testee uses the [miner] package to provide localhost tunelling.

## GruntJS

## Running tests programmatically
