/**
* This is the "main" file for the webapp.
* @author  Arthur Prevot, setup below from nodeJs tutorial (http://www.nodebeginner.org/)
*/

var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {}
handle["/"] = requestHandlers.getHome;
handle["/uploadAndGetDocPage"] = requestHandlers.uploadAndGetDocPage;
handle["/getDocPage"] = requestHandlers.getDocPage;

server.start(router.route, handle);