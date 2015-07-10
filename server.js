/*
 * Nodejs server for handling emotion wheel and dial testing
 *
 * Andy Brown.
 * andy.brown01@bbc.co.uk
 * BBC R&D. June 2015
 *
 */

var app = require('http').createServer(handler);
    // , io = require('socket.io').listen(app);
var fs = require('fs')
  , exec = require('child_process').exec;
var path = require('path');
var url = require("url");


app.listen(3003, "0.0.0.0");
console.log("listening");



/****** ****** routing ****** ******/

// routing function
function handler (req, response) {
        _url = url.parse(req.url, true);
        var loadFile =  '';
		var pathname = __dirname + _url.pathname;
		var extname = path.extname(pathname);

        // sort content type (without this, stuff like SVG not handled
        // properly in browser)
        var contentType = 'text/html';
        switch (extname) {
			case '.js':
				contentType = 'text/javascript';
				break;
			case '.css':
				contentType = 'text/css';
				break;
            case '.log':
				contentType = 'text/plain';
				break;
			case '.svg':
			case '.TTF':
				contentType = 'image/svg+xml';
				break;
        }

        // routing
        if(_url.pathname == '/video'){
                loadFile = '/index.html';
        }
        else if(_url.pathname === '/'){
                loadFile = '/index.html';
        }
        // handle webm files
        else if(extname === '.webm' || extname === '.mp4'){
			var stat = fs.statSync(pathname);
		  	if (!stat.isFile())
			{
				console.log(".webm routing got Not A File");
				return;
			}

			var start = 0;
			var end = 0;
			var range = req.headers.range;
			if (range != null) {
				start = parseInt(range.slice(range.indexOf('bytes=') + 6,
					range.indexOf('-')));
				end = parseInt(range.slice(range.indexOf('-') + 1,
					range.length));
			}
			if (isNaN(end) || end == 0) end = stat.size - 1;

			if (start > end) return;

			// console.log('Browser requested bytes from ' + start + ' to ' + end + ' of file ' + pathname);

			var date = new Date();

			response.writeHead(206, { // NOTE: a partial http response
				// 'Date':date.toUTCString(),
				'Connection':'close',
				// 'Cache-Control':'private',
				// 'Content-Type':'video/webm',
				// 'Content-Length':end - start,
				'Content-Range':'bytes ' + start + '-' + end + '/' + stat.size,
				// 'Accept-Ranges':'bytes',
				// 'Server':'CustomStreamer/0.0.1',
				'Transfer-Encoding':'chunked'
			});

			var stream = fs.createReadStream(pathname,
				{ flags:'r', start:start, end:end});
			stream.pipe(response);

			return;
        }
        else{
                loadFile = _url.pathname;
        }

        // read file and send response
        fs.readFile(__dirname + loadFile,
           function (err, data) {
                if (err) {
                    console.log(err);
                    response.writeHead(500);
                    return response.end('Error loading ' + req.url);
                }

                response.writeHead(200, {'Content-Type': contentType});
                response.end(data);
            });
}
