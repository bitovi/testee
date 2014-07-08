var Mocha = require('mocha');
var Spec = Mocha.reporters.Spec;

function MyReporter(runner) {
  var passes = 0;
  var failures = 0;

  var oldEmit = runner.emit;
  // var pass = new Spec(runner);

  runner.emit = function() {
    console.log(arguments);
    return oldEmit.apply(this, arguments);
  };
}

var runner = new Mocha({
  ui: 'bdd',
  reporter: MyReporter
});

runner.addFile(__dirname + '/fixture/blogpost.test.js');

runner.run(function() {
  console.log(arguments);
});
