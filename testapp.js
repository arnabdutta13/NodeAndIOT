/**
 * http://usejsdoc.org/
 */
var fs = require("fs");
var socketio = require("socket.io");
var http = require("http");
var omx = require('omxcontrol');
var exec = require('child_process').exec;
var child2;
var spawn2 = require('child_process').spawn
var isplaying = 0;

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

function run_shell(cmd, args, cb, song, socket) {
	var spawn = require('child_process').spawn, child = spawn(cmd, args), me = this;
	child.stdout.on('data', function(buffer) {
		cb(me, buffer);
	});
	/*function() {
		// child = spawn('omxplayer',[id+'.mp4');
		console.log("Starting to play song");
		omx.start("./" + data.id + '.mp4');
		socket.emit("playing", {'result' : "Playing song"});
	}*/
	child.stdout.on('end', function(){
		
		console.log("SONG::::: " + song);
		isplaying = 1;
		child2 = spawn2("omxplayer", [song]);
		socket.emit("play", {'result' : isplaying});
		child2.stdout.on('end', function() {
			console.log("isplaying set ==== " + isplaying );
		    isplaying = 0;
		    socket.emit("play", {'result' : isplaying});
		    console.log("isplaying unset ==== " + isplaying );
		});
		
		 /*child2 = exec("sudo omxplayer "+ song, function (error, stdout, stderr) {
		    console.log('stdout: ' + stdout);
		    console.log('stderr: ' + stderr);
		    if (error !== null) {
		      console.log('exec error: ' + error);
		    }
		    console.log("isplaying set ==== " + isplaying );
		    isplaying = 0;
		    console.log("isplaying unset ==== " + isplaying );
		});*/
		socket.emit("playing", {'result' : "Playing song"});
		
		/*child.stdout.on('data', function(buffer) {
			cb(me, buffer);
		});*/
		/*child2.stdout.on('end', function() {
			
		});*/
	});
	console.log("Song ended");
}

// '--no-check-certificate'
// scp app.js index.html pi@192.168.0.19:/home/pi/YTDedicate
io.sockets.on("connection", function(socket) {
	socket.emit("playing", {'result' : "Play your song"});
	socket.emit("play", {'result' : isplaying});
	socket.on("submit", function(data) {
		/*var sleep = require('sleep');
		while (isplaying === 1) {
			console.log("isplaying ==== " + isplaying );
			if (isplaying === 0) {
				console.log("isplaying ==== " + isplaying );
				break;
			}
			sleep.sleep(60);
			console.log("Waiting");
			console.log("isplaying ==== " + isplaying );
			
		}*/
		console.log("==== Downloading video ==== " + data.url + " id : "
				+ data.id + " " + socket);
		socket.emit("playing", {'result' : "Trying to download and play"});
		run_shell('youtube-dl', [ '-o', '%(id)s.%(ext)s', '-f 18', 
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
		}, ("./" + data.id + ".mp4"), socket);

	});
});

app.listen(8002);
console.log("Server Running");