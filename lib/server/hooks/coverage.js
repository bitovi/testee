var istanbul = require('istanbul');

module.exports = function (server, coverageObject) {
	// TODO html-cov etc.
	var report = istanbul.Report.create('text');
	var collector = new istanbul.Collector();

	collector.add(coverageObject);
	report.writeReport(collector);
};