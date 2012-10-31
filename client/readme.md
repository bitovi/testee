# Writing client adapters


    socket.emit("start", {
      environment : navigator.userAgent,
      runner : 'Jasmine'
    });

    socket.emit("suite", {
      "title": "Main test suite title",
      "root": true, // If it is the root level test suite
      "id": 0
    });

    socket.emit("suite", {
      "title": "Child test suite",
      "parent": 0,
      "id": 1
    });

    socket.emit("test", {
      "title": "The test title",
      "parent": 1, // Parent suite id
      "id": 3
    });

    socket.emit("pass", {
      "duration": 0,
      "id": 3
    });

    socket.emit("test end", {
      "id": 3
    });

    socket.emit("test", {
      "title": "A failing test",
      "parent": 1,
      "id": 4
    });

    socket.emit("fail", {
      "id": 4,
      "err": {
        "message": "expected 1 to equal 2",
        "stack": "Error: expected 1 to equal 2\n    at Assertion.assert (/Users/daff/Development/node/swarmling/node_modules/expect.js/expect.js:99:13)\n    CUSTOM STACK TRACE"
      }
    });

    socket.emit("test end", {
      "id": 4
    });

    socket.emit("suite end", {
      "id": 1
    });

    socket.emit("suite end", {
      "id": 0
    });

    socket.emit("end", {});
