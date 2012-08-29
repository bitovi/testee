Swarmling
=========

Cross browser test reporter and server

> npm install

> node server/server.js

Open [http://localhost:3996/client/qunit.html?websocket=true](http://localhost:3996/client/qunit.html?websocket=true)
and see the test results reported on the Node command line.

Also works cross domain when pointing the websocket to your server:

`http://qunit-test-width-adapter.html?websocket=192.168.0.2:3996`

## Normalized test results

TestStart:

    {
      "name" : "",
      "environment" : "",
      "runner" : "",
      "time" : 123456
    }

SuiteStart:

    {
      "name" : "",
      "time" : 123456
    }

Test:

    {
      "test" : "",
      "name" : "",
      "suite" : "",
      "total" : 10,
      "failed" : 1,
      "passed" : 9,
      "time" : 123456,
      "id" : 1,
      "assert" : [
        {
          "message" : "",
          "passed" : true
        }
      ]
    }

TestDone:

    {
      "failed" : 2,
      "passed" : 10,
      "time" : 123456
    }

## Todos

- Implement the browserstack API with [node-browserstack](https://github.com/scottgonzalez/node-browserstack/)
- Convert test results into a general format
- Local browser launchers
- Add other test frameworks (Mocha, Jasmine)
- Make configure-able and add CLI script
- Set up tunnel. Use Browserstack applet or [Pagekite](http://pagekite.net/)

## API

run.local(function(err, test) {
  test.firefox('http://localhost:3996/qunit.html?websocket=true', function(err, instance) {
    instance.on('testDone', function() {
      instance.stop();
    });
  });
 });
