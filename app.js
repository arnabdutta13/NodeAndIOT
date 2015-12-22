/**
 * http://usejsdoc.org/
 */
var fs = require("fs");
var socketio = require("socket.io");
var http = require("http");
var url = require("url");
var omx = require('omxcontrol');
var child_play;
var spawn_play = require('child_process').spawn;
var spawn = require('child_process').spawn;
var child;
var isplaying = 0;

var handler = function(request, response) {
	var pathname = url.parse(request.url).pathname;
	console.log("Request for " + pathname + " received.");
	console.log(pathname.substr(1));
	if (pathname.substr(1) === '') {
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
	}
	if (pathname.substr(1) === 'bg4.jpg') {
		fs.readFile(__dirname + "/bg4.jpg", function(error, data) {
			if (error) {
				response.writeHead(500, {
					"Content-Type" : "text/plain"
				});
				return response.end("Error loading bg4.jpg");
			} else {
				response.writeHead(200, {
					"Content-Type" : "text/html"
				});
				return response.end(data);
			}

		});
	}
	if (pathname.substr(1) === 'favicon.ico') {
		fs.readFile(__dirname + "/favicon.ico", function(error, data) {
			if (error) {
				response.writeHead(500, {
					"Content-Type" : "text/plain"
				});
				return response.end("Error loading favicon.png");
			} else {
				response.writeHead(200, {
					"Content-Type" : "text/html"
				});
				return response.end(data);
			}

		});
	}
	
};

var app = http.createServer(handler);
var io = socketio.listen(app);

function run_shell(cmd, args, cb, song, socket) {
	child = spawn(cmd, args);
	var me = this;
	child.stdout.on('data', function(buffer) {
		cb(me, buffer);
	});
	
	child.stdout.on('end', function(){
		
		isplaying = 1;
		child_play = spawn_play("omxplayer", [song]);
		socket.emit("play", {'result' : isplaying});
		child_play.stdout.on('end', function() {
			//console.log("isplaying set ==== " + isplaying );
		    isplaying = 0;
		    socket.emit("play", {'result' : isplaying});
		    //console.log("isplaying unset ==== " + isplaying );
		    console.log("Removing song : " + song);
		    fs.unlink(song);
		});
		
		socket.emit("playing", {'result' : "Playing song"});
	});
	console.log("Song ended");
}

// '--no-check-certificate'
// scp app.js index.html pi@192.168.0.19:/home/pi/YTDedicate
io.sockets.on("connection", function(socket) {
	socket.emit("playing", {'result' : "Play your song"});
	socket.emit("play", {'result' : isplaying});
	socket.on("submit", function(data) {
		console.log("==== Downloading video ==== " + data.url + " id : " + data.id + " " + socket);
		socket.emit("playing", {'result' : "Trying to download and play"});
		isplaying = 1;
		socket.emit("play", {'result' : isplaying});
		run_shell('youtube-dl', [ '-o', '%(id)s.%(ext)s', '-f 18', 
				data.url ], 
		function(me, buffer) {
			var optxt = buffer.toString();
			me.stdout += buffer.toString();
			socket.emit("playing", {'result' : "Downloading"});
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