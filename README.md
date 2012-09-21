Swarmling
=========

Cross browser test reporter and server

> npm install

> node server/server.js

Open [http://localhost:3996/client/qunit.html?websocket=true](http://localhost:3996/client/qunit.html?websocket=true)
and see the test results reported on the Node command line.

Also works cross domain when pointing the websocket to your server:

`http://qunit-test-width-adapter.html?websocket=192.168.0.2:3996`

## Test reporting events

### `start`

Fires when the test runner starts:

    {
      "environment" : "",
      "runner" : "",
      "time" : 123456
    }

### `suite`

Fires when a new test suite started. Test suites can be nested into any level. The first suite started should
be the main test.

    {
      "id" : <id>
      "title" : "My test suite",
      "root" : true,
      "parent" : <id>
    }

### `test`

    {
      "title" : "",
      "async" : 0,
      "timedOut" : false,
      "pending" : false,
      "type" : "test",
      "parent" : "parent"
    }

### `pass`

### `fail`

### `test end`

### `suite end`

### `end`

