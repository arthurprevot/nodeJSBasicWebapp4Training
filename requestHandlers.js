/**
* File to handle each URL request separatly and send html (+javascript+CSS) back to browser. 
* @author  Arthur Prevot with significant code reuse from nodeJs tutorial (http://www.nodebeginner.org/) which is about uploading one image file.
*/

var querystring = require("querystring");
var fs          = require("fs");
var formidable  = require("formidable");
var url         = require('url');


function getHome(response) {
  /**
  * Function called to get home page. Take server 'response' var and send html code back. 
  */
  console.log("Request handler 'start' was called.");

  // Create list of documents in the folder.
  fs.readdir("serverData/", function(err, listFiles) { // callback fct.
    // TODO: handle err
    // TODO: update to use a templating lib (see ExpressJS)
    var folderName = 'serverData/';
    // Init html table to contain document stats
    var docTable = '<table border="1">'+
                   '<tr>'+'<td><b>File</b></td>'+'<td><b>nbLines</b></td>'+'<td><b>nbWords</b></td>'+'</tr>';
    
    // Loop through every files on server side to get each document stats
    // TODO: rearrange to not go through files that have already been scanned.
    for (ii in listFiles) {
      var ext = listFiles[ii].slice(-4,-1) + listFiles[ii][ listFiles[ii].length-1 ]; //TODO: update to deal with any ASCII file instead of supporting only files ending with '.txt' 
      // Deal with cases where files are ".txt" or not.
      if (ext=='.txt') { 
          var docData = getDocTextSync(listFiles[ii]); 
          var fname   = '<A href="/getDocPage?fileIndex='+ii+'">'+listFiles[ii]+'</A>';
      }else{
          var docData = {};
          var fname   = listFiles[ii];
      };
      // Fill one html table row
      docTable += '<tr>'+
                   '<td>'+fname+'</td>'+
                   '<td>'+docData['nbLines']+'</td>'+
                   '<td>'+docData['nbWords']+'</td>'+
                  '</tr>';
    };
    // Out of loop, close html table
    docTable += '</table>';
    
    // Generate html page. Note: this is where templating lib would be most useful.
    var html = '<html>'+
  		     '<head>'+
  		       '<meta http-equiv="Content-Type" '+
  		       'content="text/html; charset=UTF-8" />'+
  		     '</head>'+
  		     '<body>'+
  		       '<p>Welcome'+
  		       '<p>Here are the documents available so far on the server ('+folderName+') (details only available for files ending with ".txt"). '+
  		       'To view the details for each file, click on its file name.'+
  		       '<p>'+docTable +
  		       '<p>To add a file, select it in the following field '+
  		       '(double check that the file is an ASCII file as the webapp does not check that):'+
  		       '<form action="/uploadAndGetDocPage" enctype="multipart/form-data" '+
  		         'method="post">'+
  		         '<input type="file" name="upload" multiple="multiple">'+
  		         '<input type="submit" value="Upload file" />'+
  		       '</form>'+
  		     '</body>'+
  		     '</html>';

    // Send html to browser
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(html);
    response.end();
  });
};


function uploadAndGetDocPage(response, request) {
  /**
  * Function called when uploading a document. Take server 'response' and 'request' vars and send html code back. 
  */
  console.log("Request handler 'uploadAndGetDocPage' was called.");
    
  // Sanitize the filename: //TODO: implement to deal with files added twice (to affect filename).
  function sanitizeFname(fnameIn, fnameOut) {/*TBD*/};

  // Generate file upload form, using formidable lib.
  var form = new formidable.IncomingForm();
  console.log("about to parse");
  form.parse(request, function(error, fields, files) { // callback fct.
    console.log("parsing done");
    var fname = files.upload.name;
    //TODO: fix possible error on Windows systems: tried to rename to an already existing file
    fs.rename(files.upload.path, "serverData/"+fname, function(err) { // callback fct.
      if (err) {
        fs.unlink("serverData/"+fname);
        fs.rename(files.upload.path, "serverData/"+fname);
      };
      
      // Send html to browser, with content taken from getDocTextSync
      response.writeHead(200, {"Content-Type": "text/html"});
      response.write(getDocTextSync(fname)['body']);
      response.end();
    });
  });
};


function getDocPage(response, request) {
  /**
  * Function called when clicking on a document from the home page. Take server 'response' and 'request' vars and send html code back. 
  */
  console.log("Request handler 'getDocPage' was called.");

  // Get the filename from the URL fileIndex argument
  var url_parts = url.parse(request.url,true);
  var fileIndex = url_parts.query.fileIndex;
  fs.readdir("serverData/", function(err, listFiles) { // callback fct.
    var fname = listFiles[fileIndex];
    
    // Send html to browser, with content taken from getDocTextSync
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(getDocTextSync(fname)['body']);
    response.end();
  });
  
};


function getDocTextSync(fname) {
  /**
  * Function called by uploadAndGetDocPage and getDocPage. Takes file name as input and returns doc html and stats back. 
  * Note: this is not a request handler function like all other main functions (i.e. first level) in this file.
  */

  // Read the file. 
  var docContent = fs.readFileSync("serverData/"+fname, "binary"); //Note: getDocTextSync is always called within asynchronous calls so using synchronous call here considered not as critical. Would need to remove return statement and pass return variables to a call back function added as input to getDocTextSync to use the asynchronous version of the function. TODO: look if time available later.

  // Get stats on the file content. 
  //TODO: could find another approach to not go through full content several times.
  //TODO: line count sometimes wrong (see ipsum lorem file), as does not deal with consecutive end of line markers (\n). to be fixed if time permits.
  var nbLines=docContent.split("\n").length;
  
  // Following 3 lines from http://www.mediacollege.com/internet/javascript/text/count-words.html
  //TODO: word count sometimes wrong (see ipsum lorem file). to be fixed if time permits.
  var docContentTmp = docContent.replace(/(^\s*)|(\s*$)/gi,"");
  docContentTmp = docContentTmp.replace(/[ ]{2,}/gi," ");
  docContentTmp = docContentTmp.replace(/\n /,"\n");
  var nbWords=docContentTmp.split(" ").length;

  // Change formatting to display text file on html page. //TODO: probably libraries available for more robust conversion.
  docContent = docContent.replace(/\n/g, "<br />"); 

  // Generate html for document content and stats
  //TODO: Formatting injected in html directly instead of CSS, to be changed later if time permits.
  var body = 'See below the content of the document (or <A href="/">go back to the home page</A>).'+
             '<br>File name : <b>'+fname+'</b>'+
             '<br>Content :'+
             '<div id="doc" style="border:1px solid #c3daf9">'+docContent+'</div>'+
             '<br>Number of lines: <b>'+nbLines+ '</b> (Note: empty lines in original file are counted as separate lines, consecutive empty lines will then be counted as several lines even if not visible above.)'+
             '<br>Number of words: <b>'+nbWords+ '</b> (Note: algorithm counts single characters as words, other caveats to be identified and listed)';

  return {'body':body, 'nbLines': nbLines, 'nbWords': nbWords};
};



exports.getHome = getHome;
exports.uploadAndGetDocPage = uploadAndGetDocPage;
exports.getDocPage = getDocPage;
