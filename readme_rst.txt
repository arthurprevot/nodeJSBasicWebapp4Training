Overview
==========

Code for a basic nodeJs webapp to learn nodeJS. It consists of a listing of text documents available on the server side, together with some statistics about each document (number of words and lines), a web page for each document showing the full content of the document together with its stats. It allows the user to upload new text files.

More details
==========

# To install and run # 

 * Versions: nodeJs v0.8.2, formidable v1.0.11 (js lib to handle file upload).
 * Installation of dependancy: run "npm install formidable" from project root folder.
 * Run server with "node app.js" from project root folder.

# Overview of the design #

The architecture borrows heavily from a very good node Js tutorial at http://www.nodebeginner.org. The main file (app.js) starts the server (from server.js) and gives it access to the request handler functions (from requestHandlers.js) through the router (in router.js). The tutorial shows how to upload an image file (using formidable) and display it in the browser. I started from there and modified it to
 * handle several files instead of one (whose name was hardcoded on the server side),
 * deal with text files instead of images,
 * Add more content to both the home page and the document specific pages (statistics, document content and tables) and add navigation between these 2 pages.
When requesting the home page in the browser, the server goes through every files in a folder (serverData/) and builds the statistics for the files with '.txt' extension only. This home page then allows the user to either see the details for a specific document or upload a file, which will be uploaded and then shown in the same document specific view as all other documents. When loading any document specific page, the server re-analyzes the document at hand to display its content and statistics. This approach should be robust but requires significant resources.

# Potential performance issues #

 * Goes through every document each page the user goes back to the home page. Could pull that from a database.
 * Does not handle non ASCII files when asking for upload, so will upload the file and output garbage stats on the document page, although the page for that non ASCII file will not be available again after this upload process, as the home page table filters for '.txt' files.
 * No provision do deal with very large text files.
 * Does not deal properly with uploading files with same name as another one on server side, just overwrites the file on the server side.
 * One synchronous fs call, although called within asynchronous call, see comments in requestHandlers.js->getDocTextSync(). Could be changed later.
 * Some issues with word and line counts in corner cases. Open page for 'file3 lorem ipsum.txt' to see unexpected line and word counts. For line count, consecutive end of line markers (\n) will be counted as several lines for example. Didn't take the time to fix it.
 * The document specific HTML pages are generated without specifying the html header tags but this was not an issue on both browsers I tried (firefox and safari, latest versions). Could an issue on other or older browsers, unless the blanks are filled in by nodeJs on the server side. 
 * File with unconventional filenames may cause problems. A placeholder for a filename sanitization function is added but not implemented.


# Some design issues/notes #

 * The html portion of the code was minimal so I didn't use a templating library (like ExpressJS). Should be updated if expanded.
 * Some formatting (like <b>) was injected directly in the html instead of through CSS to make it faster.
 * request handler functions are all into one file (requestHandlers.js) because of the small size of the project. Adding functionalities would probably require splitting the functions into several files.
 * Does not deal with user specific documents.
 * unit-testing could be added.


# TODO list #

 * search for 'TODO' in the code. Most important one are listed above.
