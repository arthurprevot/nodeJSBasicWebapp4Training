/**
* File to start the nodeJs web server.
* @author  Arthur Prevot, setup below from nodeJs tutorial (http://www.nodebeginner.org/)
*/

var http = require("http");
var url = require("url");

function start(route, handle) {
  http.createServer(onRequest).listen(8888);

  function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    console.log("Request for " + pathname + " received.");
    route(handle, pathname, response, request);
  }

  console.log("Server has started.");
}

exports.start = start;
