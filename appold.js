/**
 * http://usejsdoc.org/
 */
var fs = require("fs");
var socketio = require("socket.io");
var http = require("http");
var omx = require('omxcontrol');

var handler = function(request, response) {
	fs.readFile(__dirname + "/index.html", function(error, data) {
		if (error) {
			response.writeHead(500, {
				"Content-Type" : "text/plain"
			});
			return response.end("Error loading index.html");
		} else {
			response.writeHead(200, {
				"Content-Type" : "text/html"
			});
			return response.end(data);
		}

	});
};

var app = http.createServer(handler);
var io = socketio.listen(app);

function run_shell(cmd, args, cb, end) {
	var spawn = require('child_process').spawn, child = spawn(cmd, args), me = this;
	child.stdout.on('data', function(buffer) {
		cb(me, buffer);
	});
	child.stdout.on('end', end);
	console.log("Song ended");
}

// '--no-check-certificate'
// scp app.js index.html pi@192.168.0.19:/home/pi/YTDedicate
io.sockets.on("connection", function(socket) {
	socket.emit("playing", {'result' : "Play your song"});
	socket.on("submit", function(data) {
		console.log("==== Downloading video ==== " + data.url + " id : "
				+ data.id + " " + socket);
		socket.emit("playing", {'result' : "Trying to download and play"});
		var runShell = new run_shell('youtube-dl', [ '-o', '%(id)s.%(ext)s', '-f 18', 
				data.url ], 
		function(me, buffer) {
			var optxt = buffer.toString();
			me.stdout += buffer.toString();
			/*socket.emit("loading", {
				output : me.stdout
			});*/
			socket.emit("playing", {'result' : "downloading"});
			if (optxt.indexOf("%") > 0 ) {
				var op = "Downloaded " + optxt.substring(optxt.indexOf("%") - 4);
				console.log(op);
				socket.emit("downloading", {'result' : op});
			}
			
			console.log(me.stdout);
		}, function() {
			// child = spawn('omxplayer',[id+'.mp4']);
			console.log("Starting to play song");
			omx.start("./" + data.id + '.mp4');
			socket.emit("playing", {'result' : "Playing song"});
		});

	});
});

app.listen(8002);
console.log("Server Running");