---
layout: default
---

## Getting started

You need [NodeJS](http://nodejs.org/) installed in order to use Testee which makes the installation as easy as:

> `npm install -g testee`

`cd` into the main folder of your JavaScript project and run `testee` with your QUnit, Mocha or Jasmine
test HTML page:

> `testee tests/qunit.html`


## Command line testing

The default browser is [PhantomJS](http://phantomjs.org/), just make sure you have it installed anywhere
on your system.

To run with a different local browser (e.g. Firefox) use:

> `testee tests/qunit.html --browser firefox`

Note that the browser you are using for testing shouldn't be already running.


### Command line options

On the command line, you have the following options available:

* `-h`, `--help`: output usage information
* `-V`, `--version`: output the version number
* `-b`, `--browser` `[name]`: The browser you want to run (default: `phantom`)
* `-l`, `--launch` `[name]` (*default: `local`*): The test environment you want to use.
* `-t`, `--tunnel` `[name]`: The tunneling service provider to use. Currently supports local, localtunnel, browserstack and pagekite (default: `local`)
* `-p`, `--port` `[port]`: The port to run the server on (default: `3996`)
* `-r`, `--reporter` `[name]`: The name of the reporter to use (default: `Dot`)
* `-v`, `--verbose`: Writes a log file with debugging information
* `-l`, `--log` `[file]`: If in verbose mode, the name of the logfile to write to (default: `testee.log`)
* `-c`, `--config` `[file]`: Use this JSON configuration file (can be overwritten by command line options)
* `--timeout` `[seconds]`: The per test timeout (in seconds)


### Examples

Run `test.html` in the `/var/www/app/` folder using Safari:

> `testee --root /var/www/app/ --browser safari test.html`

Run `tests/qunit.html` with PhantomJS from the current folder, use port `8080` instead of `3996` and
use the `Spec` reporter which prints more detailed test results:

> `testee --port 8080 --reporter Spec tests/qunit.html`

Run `tests/mocha.html` using `testee.json` as the configuration file (see the [configuration API](#configuration_api)
for how this file should look like):

> `testee -c testee.json tests/mocha.html`

Run `tests/jasmine.html` using [Google Chrome Canary](https://www.google.com/intl/en/chrome/browser/canary.html):

> `testee --browser canary tests/jasmine.html`


### Command line Browserstack

It is also possible to start tests using a [Browserstack](http://browserstack.com) worker from the command
line by setting the `launch` option to `browserstack` and the `browser` to a string in the form of
`<browser>:<version>@<os>`. You will then be prompted for your Browserstack username and password.
Because workers don't have direct access to your local system, a [localhost tunneling](#localhost_tunneling)
service will be started ([localtunnel](http://progrium.com/localtunnel/) by default).

For example, run `tests/qunit.html` on Internet Explorer 8:

> `testee --browser ie:8.0@win --launch browserstack qunit/test.html`

Or Firefox 15 on MacOS:

> `testee --browser firefox:15.0@macos --launch browserstack qunit/test.html`

The use of a configuration file is generally the better choice when using Browserstack. For more options, read up
in the [configuration API](#configuration_api) section. To use different tunelling services (like the [Browserstack command line tunnel](http://www.browserstack.com/local-testing)) jump to [Localhost Tunelling](#localhost_tunneling) and for Browserstack specific options read more in the [Browserstack section](#browserstack).


### CI integration

Because Testee allows to use different reporters for the test result output it is easy to obtain XUnit
style XML files that integrate with CI servers like [Jenkins](http://jenkins-ci.org/). Just use the `XUnit`
reporter and write the output into a file. The following example runs `tests/qunit.html` in Firefox and writes
the result XML into `testresults.xml`:

> `testee --browser firefox --reporter XUnit > testresults.xml`

You can get more information about the available reporters in the [Reporters](#reporters) section.


## Configuration API

The following sections describe the available options for

* the JSON configuration file if you run Testee from the command line using the `-c` or `--config` option
* the [GruntJS task](#gruntjs) task configuration
* programmatic usage with NodeJS


### Default configuration

Any options will be merged with the following default configuration:

<pre><code data-language="javascript">{
  "root" : ".",
  "port" : 3996,
  "verbose" : false,
  "log" : "./testee.log",
  "timeout" : 120,
  "launch" : "local",
  "tunnel" : "local",
  "browser" : "phantom",
  "reporter" : "Dot"
}</code></pre>


### General settings

__`root` *{String}*__<br />
Every time when running a test, Testee will start a static file server, by default in the current folder.
That way, any test HTML file you reference will be loaded properly. The `root` option allows you to change
the root path of the static fileserver.

__`port` *{Integer}*__<br />
The port for the static file server to start on. This will also be used by [Localhost tunneling services](#localhost_tunneling). The default is `3996`.

__`verbose` *{Boolean}*, `log` *{String}*__<br />
Set this option to `true` if you would like Testee to output debugging information into a `log` file.
It is not possible to output debugging information on the console since it is used by the reporters.

__`timeout` *{Integer}*__<br />
The time (in seconds) to wait for a test page to report back and after which an error will be thrown.
The default is 2 minutes. This timeout might, for example, occurr when the given file doesn't exist the
browser didn't start or the localhost tunnel isn't running.


### Reporters

The `reporter` option allows you to use almost any of the console reporters included in the
[Mocha testing library](http://visionmedia.github.com/mocha/#reporters).


### Launching browsers

The `launch` and `browser` options are used to set the environment and the browser you want
to start. [Launchpad](https://github.com/ekryski/launchpad) is the browser launcher library used
by Testee which allows you to start most locally installed browsers as well as Browserstack workers
and even browsers on remote systems running the [Launchpad Server](https://github.com/ekryski/launchpad#the-launchpad-server).

The most common case will be launching a local browser (which is also the default) with no settings:

<pre><code data-language="javascript">{
  "browser" : "firefox"
}</code></pre>

#### Browserstack

Browserstack hosts virtual machines running specific versions of web browsers. It is an extremely useful
tool for cross-browser testing running a remote desktop in you browser. To use BrowserStack via the configuration
API you need to provide a username and password:

<pre><code data-language="javascript">{
  launch: {
    type: "browserstack",
    username: "your browserstack username",
    password: "your browserstack password"
  }
}</code></pre>

To start a worker, you must provide a valid [browser object](https://github.com/scottgonzalez/node-browserstack#browser-objects) to the `browser` option:

<pre><code data-language="javascript">{
  browser: {
    os: "win",
    browser: "ie",
    version: 8.0
  }
}</code></pre>

An example configuration that runs your tests on an iPad 4 emulator using BrowserStack in a CI environment
(outputting XUnit logs) could look like this:

<pre><code data-language="javascript">{
    "reporter" : "XUnit",
    launch: {
      type: "browserstack",
      username: "your browserstack username",
      password: "your browserstack password"
    },
    browser: {
      device: "ipad4",
      version: 6.0
    }
  }
}</code></pre>

### Localhost tunneling

A localhost tunneling service makes your local system available to the outside world. This is great
if you want to run tests on another system which can't easily reach your local machine. Testee
relies on localhost tunneling services especially for giving Browserstack workers an endpoint to
communicate with.

Testee uses the [Miner](https://github.com/daffl/miner) package to provide localhost tunneling which
makes it possible to use any of the services Miner currently supports (LocalTunnel, Pagekite and Browserstack).Localtunnel doesn't need any configuration at all and will install itself if you have Ruby available.

If you would like to use Pagekite you need to set it up with your username and then pass it to the `launch` option
like this:

<pre><code data-language="javascript">
  "launch" : {
		"type" : "pagekite",
		"username" : "pagekit user"
	}
</code></pre>

It is also possible to use the [Browserstack command line tunnel](http://www.browserstack.com/automated-browser-testing-api) which you have to provide with your command line tunnel API key:

<pre><code data-language="javascript">
	"launch" : {
		"type" : "browserstack",
		"key" : "your command line tunnel API key"
	}
</code></pre>

For all available tunneling services and options follow up in the [Miner documentation](http://daffl.github.com/miner/).

### Running tests programmatically


## GruntJS

The Testee NodeJS package also provides a [GruntJS](http://grunsj.com) task so you can easily run
tests in your Grunt file.

## FAQ

*__Can I test more than one file and browser at once?__*<br />
No. At the moment Testee only allows running one test file on one browser. The ability to
test multiple files is under development (see issue [#6]()).

*__Something isn't working, where can I get help?__*<br />
Everywhere!