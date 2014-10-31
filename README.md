# Testee

Run your QUnit, Mocha or Jasmine tests from the command line with any browser.

- Runs on all browsers (supporting SocketIO)
- Many output formats
- CI integration
- BrowserStack support
- Code coverage
- GruntJS Task
- Remote URL testing


## Getting started

You need [NodeJS](http://nodejs.org/) installed in order to use Testee which makes the installation as easy as:

> `npm install -g testee`

`cd` into the main folder of your JavaScript project and run `testee` with your QUnit, Mocha or Jasmine
test HTML page:

> `testee tests/qunit.html`


## Command line testing

The default browser is [PhantomJS](http://phantomjs.org/), just make sure you have it installed anywhere
on your system.

To run with different local browsers (e.g. Firefox and Safari) use:

> `testee tests/qunit.html --browsers firefox,safari`

Or run multiple tests in multiple browsers:

> `testee tests/unit.html tests/components.html --browsers firefox,safari`

Note that the browser you are using for testing shouldn't be already running (except for PhantomJS which can be started multiple times).


### Command line options

On the command line, you have the following options available:

* `-h`, `--help`: output usage information
* `-V`, `--version`: output the version number
* `-b`, `--browsers` `[name]`: A comma separated list of browsers you want to run (default: `phantom`)
* `-R`, `--root [path|URL]`: The server root path or URL the files are relative to
* `-p`, `--port` `[port]`: The port to run the server on (default: `3996`)
* `-r`, `--reporter` `[name]`: The name of the reporter to use (default: `Dot`)
* `-c`, `--config` `[file]`: Use this JSON configuration file (can be overwritten by command line options)
* `--timeout` `[seconds]`: The per test timeout (in seconds)
* `--delay` `[ms]`: When running multiple tests, the time to wait for the browser to shut down before starting it with a new page.
* `-s`, `--server`: Only run the server
* `--coverage`: Enable code coverage


### Examples

Run `test.html` in the `/var/www/app/` folder using Safari:

> `testee test.html --root /var/www/app/ --browsers safari`

Run the online [Underscore](http://underscorejs.org/) QUnit tests in Phantom and Firefox and output code coverage statistics:

> `testee test/index.html --root http://underscorejs.org --browsers phantom,firefox`

Run `tests/qunit.html` with PhantomJS from the current folder, use port `8080` instead of `3996` and
use the `Spec` reporter which prints more detailed test results:

> `testee tests/qunit.html --port 8080 --reporter Spec`

Run `tests/mocha.html` using `testee.json` as the configuration file (see the [configuration API](#configuration_api)
for how this file should look like):

> `testee tests/mocha.html -c testee.json`

Run `tests/jasmine.html` using [Google Chrome Canary](https://www.google.com/intl/en/chrome/browser/canary.html):

> `testee tests/jasmine.html --browsers canary`


### CI integration

Because Testee allows to use different reporters for the test result output it is easy to obtain XUnit
style XML files that integrate with CI servers like [Jenkins](http://jenkins-ci.org/). Just use the `XUnit`
reporter and write the output into a file. The following example runs `tests/qunit.html` in Firefox and writes
the result XML into `testresults.xml`:

> `testee test/index.html --browsers firefox --reporter XUnit > testresults.xml`

You can get more information about the available reporters in the [Reporters](#reporters) section.


### Debugging

Testee uses the Node [debug](https://github.com/visionmedia/debug) module. Detailed debugging information can be enabled
in any environment (command line, Grunt, programatically) by setting the `DEBUG` environment variable to `testee:*`:

> `DEBUG=testee:* testee --browsers canary tests/jasmine.html`


## Configuration API

The following sections describe the available options for

* the JSON configuration file if you run Testee from the command line using the `-c` or `--config` option
* the [GruntJS task](#gruntjs) task configuration
* programmatic usage with NodeJS


### Default configuration

Any options will be merged with the following default configuration:

```js
{
  port: 3996,
  root: process.cwd(),
  reporter: 'Dot',
  timeout: 120,
  delay: 1000,
  tunnel: {
    type: 'local'
  },
  launch: {
    type: 'local'
  }
}
```


### General settings

__`root` *{String}*__<br />
Every time when running a test, Testee will start a static file server, by default in the current folder.
That way, any test HTML file you reference will be loaded properly. The `root` option allows you to change
the root path of the static fileserver.

__`port` *{Integer}*__<br />
The port for the static file server to start on. This will also be used by [Localhost tunneling services](#localhost_tunneling). The default is `3996`.

__`timeout` *{Integer}*__<br />
The time (in seconds) to wait for a test page to report back and after which an error will be thrown.
The default is 2 minutes. This timeout might, for example, occurr when the given file doesn't exist the
browser didn't start or the localhost tunnel isn't running.

__`delay` *{Integer}*__<br />
Multiple test files will be run in sequence on the same browser. This option sets the delay (in ms) between
launching the browser again with the same file.

### Reporters

The `reporter` option allows you to use all of the console reporters included in the
[Mocha testing library](http://visionmedia.github.com/mocha/#reporters).


### Launching browsers

The `launch` and `browsers` options are used to set the environment and the browsers you want
to start. [Launchpad](https://github.com/ekryski/launchpad) is the browser launcher library used
by Testee which allows you to start most locally installed browsers as well as Browserstack workers
and even browsers on remote systems running the [Launchpad Server](https://github.com/ekryski/launchpad#the-launchpad-server).

The most common case will be launching a local browser (which is also the default) with no settings:

```js
{
  "browsers" : [ "firefox", "safari" ]
}
```

#### Browserstack

Browserstack hosts virtual machines running specific versions of web browsers. It is an extremely useful
tool for cross-browser testing running a remote desktop in you browser. To use BrowserStack via the configuration
API you need to provide a username and password:

```js
{
  "launch": {
    "type": "browserstack",
    "username": "your browserstack username",
    "password": "your browserstack password",
    "version": "browserstack API version (recommended: 2)"
  }
}
```

To start a worker, you must provide a valid [browser object](https://github.com/scottgonzalez/node-browserstack#browser-objects) to the `browser` option:

```js
{
  browsers: [{
    os: "win",
    browser: "ie",
    version: 8.0
  }, {
    os: "win",
    browser: "ie",
    version: 11.0
 }]
}
```

An example configuration that runs your tests on an iPad Mini and Samsung Galaxy S3 emulator using BrowserStack
in a CI environment (outputting XUnit logs) could look like this:

```js
{
    "reporter" : "XUnit",
    "tunnel": {
      "type": "browserstack",
      "key": "your browserstack key"
    },
    "launch": {
      "type": "browserstack",
      "username": "your browserstack username",
      "password": "your browserstack password",
      "version": 2
    },
    "browsers": [{
      "os": "ios",
      "device": "iPad Mini",
      "version": 6.0
    }, {
      "os": "android",
      "device": "Samsung Galaxy S III",
      "version": "4.1"
    }]
  }
}
```


### Localhost tunneling

A localhost tunneling service makes your local system available to the outside world. This is great
if you want to run tests on another system which can't easily reach your local machine. Testee
relies on localhost tunneling services especially for giving Browserstack workers an endpoint to
communicate with.

Testee uses the [Miner](https://github.com/daffl/miner) package to provide localhost tunneling which
makes it possible to use any of the services Miner currently supports (LocalTunnel, Pagekite and Browserstack).
Localtunnel doesn't need any configuration at all and will install itself if you have Ruby available.

If you would like to use Pagekite you need to set it up with your username and then pass it to the `launch` option
like this:

```js
"launch" : {
  "type" : "pagekite",
  "username" : "pagekit user"
}
```

It is also possible to use the [Browserstack tunnel API](http://www.browserstack.com/automated-browser-testing-api) which you have to provide with your command line tunnel API key:

```js
"launch" : {
  "type" : "browserstack",
  "key" : "your command line tunnel API key"
}
```

For all available tunneling services and options follow up in the [Miner documentation](http://daffl.github.com/miner/).


## Grunt task

Testee comes with a Grunt task that takes the same options as described above (`src` should be set to your source test files).
The following is an example that runs `test/index.html` with `public/` as the root folder and `Spec` as the reporter in either

- PhantomJS
- PhantomJS with code coverage ignoring the `bower_components` and `test/` folder
- On Browserstack on iPad Mini and Samsung Galaxy S3 with `BROWSERSTACK_USER` and `BROWSERSTACK_PASSWORD` taken from environment variables

```js
module.exports = function(grunt) {
  grunt.initConfig({
    testee: {
      options: {
        root: 'public',
        reporter: 'Spec'
      },
      phantom: ['test/index.html'],
      coverage: {
        options: {
          coverage: {
            ignore: ['bower_components/', 'test/']
          }
        },
        src: ['test/index.html']
      },
      browserstack: {
        options: {
          timeout: 600,
          tunnel: {
            type: 'browserstack',
            key: process.env.BROWSERSTACK_PASSWORD
          },
          launch: {
            type: 'browserstack',
            username: process.env.BROWSERSTACK_USER,
            password: process.env.BROWSERSTACK_PASSWORD,
            version: 2
          },
          browsers: [{
            "os": "ios",
            "device": "iPad Mini",
            "version": 6.0
          }, {
            "os": "android",
            "device": "Samsung Galaxy S III",
            "version": "4.1"
          }]
        },
        src: ['test/index.html']
      }
    }
  });

  grunt.loadNpmTasks('testee');
};
```

## Client side configuration

In most cases there is no need to change your actual test code. The exception is when you load your testing library using an asynchronous client side loader like Steal or RequireJS because Testee won't know which library adapters to attach. In this case, you need to call `Testee.init()` manually once the test library is loaded:

```js
<script type="text/javascript">
  define(['qunit'], function() {
    // Needs to check because it will only be available
    // when running the test with Testee
    if(window.Testee) {
      window.Testee.init();
    }

    QUnit.start();
  });
</script>
```
