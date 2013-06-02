/* Settings */
var debug = true;

/* Dependencies */
var querystring = require('querystring');
var url = require('url');
var request = require('request');
var http = require('http');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var settings = require('./settings.json');

var mpcUrl = settings.mpcUrl; //Where MPC is listening
var webRoot = settings.webRoot; //Root directory of website to host. Don't include trailing backslash
var mpcServer = http.Server(function(req, res)
{
	if (req.method == 'OPTIONS')
	{
		var headers = 
		{
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST',
			'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
			'Access-Control-Max-Age': '86400'
		}
		res.writeHead(200, headers);
		res.end();
	} else if (req.method == 'GET')
	{
		var headers = 
		{
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST',
			'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
		}
		res.writeHead(200, headers);
		if (req.url.indexOf('/command') == 0)
		{
			//Handle commands from web app
			var url_parts = url.parse(req.url, true);
			var query = url_parts.query;
			if (query.Command != 'Status')
				if(debug) console.log(query);
			switch (query.Command)
			{
				case 'Status':
					mpc.player.getStatus(function(status)
					{
						res.end(JSON.stringify(status));
					});
					break;
				case 'Open':
					mpc.player.open(query.FilePath);
					res.end();
					break;
				case 'GoTo':
					mpc.player.goTo(query.position);
					res.end();
					break;
				case 'GetContents':
					browser.getList(query.dir, query.types, function(files)
					{
						res.end(JSON.stringify(files));
					});
					break;
				case 'Volume':
					mpc.player.setVolume(query.val);
					res.end();
					break;
				case 'Launch':
					exec('"' + settings.mpcPath + '"');
					res.end();
					break;
				case 'Close':
					exec("MoveWindow.exe close");
					res.end();
					break;
				case 'Bounds':
					exec("MoveWindow.exe bounds", function(error, stdout, stderr)
					{
						var bounds = stdout;
						res.end(bounds);
					});
					break;
				case 'Move':
					exec("MoveWindow.exe " + query.x + ' ' + query.y);
					res.end();
					break;
				default:
					mpc.player.sendCommand(query.Command);
					res.end();
					break;
			}
		} else
		{
			//Normal web server stuff
			var fileName = (req.url == '/') ? '/default.html' : req.url;
			if (fileName.indexOf('?') > -1)
				fileName = fileName.substring(0, fileName.indexOf('?'));
			var file = fs.readFile(webRoot + fileName, function(error, data)
			{
				if(!error)
				{
					var extension = fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length)
					var contentType = "";
					switch (extension)
					{
						case 'js':
							contentType = 'text/javascript';
							break;
						case 'css':
							contentType = 'text/css';
							break;
						case 'htm': case 'html':
							contentType = 'text/html';
							break;
						case 'png': case 'gif': case 'jpg': case 'jpeg':
							contentType = 'image/' + extension;
							break;
						case 'ico':
							contentType = 'image/x-icon';
							break;
						case 'woff':
							contentType = 'font/x-woff';
							break;
						default:
							contentType = 'text/html';
							break;
					}
					if(debug) console.log('Sending file as ' + contentType + ': ' + fileName);
					res.writeHead('200', {'content-type': contentType});
					res.end(data);
				}else
				{
					if(debug) console.log('Requested file not found: ' + webRoot + fileName);
					res.writeHead('404');
					res.end("404 - File not found.");
				}
			});
		}
	}
});


mpcServer.on('listening', function()
{
	console.log("MPC Remote Server listening on port " + settings.serverPort);
});

mpcServer.on('error', function(e) { serverError(e, settings.serverPort) });

mpcServer.listen(settings.serverPort);


function serverError(e, port)
{
	if (e.code == 'EADDRINUSE')
		console.log('Failed to start server. Port ' + port + ' is already in use.');
		setTimeout(function()
		{
			//Give user time to read message
		}, 5000);

}




function OnStatus(FileName, Status, CurrentFrame, CurrentTime, TotalFrames, TotalTime, Muted, Volume, FilePath)
{
	var status = {
		fileName: FileName.replace(/\\/g, ''),
		status: Status,
		currentFrame: CurrentFrame,
		currentTime: CurrentTime,
		totalFrames: TotalFrames,
		totalTime: TotalTime,
		muted: (Muted == 1) ? true : false,
		volume: Volume,
		filePath: FilePath
	}
	return status;

}

var mpc = {};
mpc.player = {
	open: function(filePath)
	{
		SendRequest(mpcUrl + '/browser.html?path=' + escape(filePath));
	},
	sendCommand: function(command)
	{
		SendRequest(mpcUrl + '/command.html?wm_command=' + command);
	},
	getStatus: function(callback)
	{
		SendRequest(mpcUrl + '/status.html', function(error, response, body)
		{
			//Escape backslashes
			if (body)
			{
				var data = body.replace(/\\/g, '\\\\');
				var status = eval(data);
				callback(status);
			} else
			{
				callback({data:null});
			}

		});
	},
	goTo: function(time)
	{
		SendRequest(mpcUrl + '/command.html?wm_command=-1&position=' + time);
	},
	setVolume: function(volume)
	{
		SendRequest(mpcUrl + '/command.html?wm_command=-2&volume=' + volume);
	}

}
var browser = {};
browser.getList = function(dir, types, callback)
{
	//TODO: Accept sort and do sorting
	//Add more metadata to returned list so we can see file size, date modified, maybe even duration
	dir = unescape(dir);
	if (dir == '/')
	{
		callback(DriveLetters());
	}
	else
	{
		//request.get(mpcUrl + '/browser.html?path=' + dir);
		fs.readdir(dir, function(err, files)
		{
			var contents = [];
			if (files)
			{
				types = types.split(',');
				for (var i = 0; i < files.length; i++)
				{
					try
					{
						var stats = fs.statSync(path.join(dir, files[i]))
						if (stats.isDirectory())
						{
							contents.push({
								name: files[i],
								type: 'directory',
								modified: stats.mtime
							});
						} else
						{
							var ext = files[i].substring(files[i].lastIndexOf('.') + 1, files[i].length);
							if (types.contains(ext))
							{
								contents.push({
									name: files[i],
									type: 'file',
									ext: ext,
									modified: stats.mtime
								});
							}
						}
					} catch(exception)
					{
					}
				}
				callback(contents);
			} else
			{
				callback();
			}
		});
	}

}
Array.prototype.contains = function(value)
{
	for (var i = 0; i < this.length; i++)
	{
		if (this[i] == value)
			return true;
	}
	return false;
}

function SendRequest(url, callback)
{
	try
	{
		var req;
		if (callback)
		{
			req = request.get(url, callback);
		} else
		{
			req = request.get(url);
		}

		req.on('error', function()
		{
			//MPC isn't running
		});

	} catch(ex)
	{
		//MPC isn't running
		if(debug) console.log(ex);
	}
}



function DriveLetters()
{
	var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
	var driveLetters = [];
	var done = false;
	for (var i = 0; i < letters.length; i++)
	{
		try
		{
			fs.readdirSync(letters[i] + ':');
			var entry = {name: letters[i] + ':\\', type: 'drive'};
			driveLetters.push(entry);
		}
		catch(ex){}
	}
	return driveLetters;
}

String.prototype.unescape = function()
{
	return this.replace(/\\\\/g, '\\');
}




