var gulp = require("gulp");
var Candyman = require("candyman");

var candyman = new Candyman({
	targetDevices : [{devicename: 'raspberrypi', hostname: '192.168.0.19'}],
	projectName: 'YTDedicate',
	user: 'pi',
	password: 'raspberry',
	startFile: 'app.js',
	root: '/home/pi'
});
gulp.task('default', function(){
	console.log("Running default task");
});
gulp.task('deploy', function() {
	candyman.deploy();
});