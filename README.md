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
    	"id" : <id>,
    	"title" : "Suite test",
    	"pending" : false,
    	"root" : true
    }

### `test`

    {
    	"title" : "test title",
    	"async" : false,
    	"timedOut" : false,
    	"pending" : false,
    	"type" : "test",
    	"parent" : <suite id>,
    	"id" : <id>
    }

### `pass`

    {
      "duration" : <duration>,
      "state" : "passed",
      "speed" : "fast",
      "id" : <test id>
    }

### `fail`

### `test end`

    {
      "id" : <test id>
    }

### `suite end`

    {
      "id" : <suite id>
    }

### `end`

