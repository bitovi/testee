Swarmling
=========

Cross browser test reporter and server

> npm install
> node server/server.js

Open [http://localhost:3996/client/qunit.html?websocket=true](http://localhost:3996/client/qunit.html?websocket=true)
and see the test results reported on the Node command line.

Also works cross domain when pointing the websocket to your server:

`http://qunit-test-width-adapter.html?websocket=192.168.0.2:3996`

## Todos

- Make configure-able and add CLI script
- Implement the browserstack API with [node-browserstack](https://github.com/scottgonzalez/node-browserstack/)
- Set up tunnel. Use Browserstack applet or [Pagekite](http://pagekite.net/)
- Local browser launchers
- Add other test frameworks (Mocha, Jasmine), probably need general format for transfering tests
