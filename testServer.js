/**
 * http://usejsdoc.org/
 */
var fs = require("fs");
var socketio = require("C:/Program Files (x86)/nodejs/node_modules/socket.io/index");
var http = require("http");
var url = require("url");


var handler = function(request, response) {
	var pathname = url.parse(request.url).pathname;
	console.log("Request for " + pathname + " received.");
	console.log(pathname.substr(1));
	if (pathname.substr(1) === '') {
		fs.readFile(__dirname + "/testIndex.html", function(error, data) {
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
	if (pathname.substr(1) === 'favicon.png') {
		fs.readFile(__dirname + "/favicon.png", function(error, data) {
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

app.listen(8002);
console.log("Server Running");