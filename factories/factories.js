var server = getItem('NodeServer') + ':' + (getItem('NodePort') || '8000');

var requestRunning = false;

//Variable used to avoid updating the status when we're changing certain things. Helps with the skippy effect: when you hit Pause and it shows the pause icon, then the play icon for a split second, then pause again.
var waitForIt = false;
app.factory('MpcFactory', function($http)
{
	var mpcFactory = {
		controls: {},
		browser: {}
	};
	mpcFactory.Command = function(command)
	{
		return $http.get('http://' + server + '/command?Command=' + command + rand()).then(function(response)
		{
			waitForIt = false;
			var results = response.data;
			return results;
		});
	}
	mpcFactory.Launch = function(x, y)
	{
		return $http.get('http://' + server + '/command?Command=Launch&x=' + x + '&y=' + y + rand());
	}
	mpcFactory.Close = function()
	{
		return $http.get('http://' + server + '/command?Command=Close' + rand());
	}



	mpcFactory.controls = 
	{
		Play: function()
		{
		},
		Pause: function()
		{
		},
		PlayPause: function()
		{
			waitForIt = true;
			return $http.get('http://' + server + '/command?Command=889' + rand()).then(function(response)
			{
				waitForIt = false;
				var results = response.data;
				return results;
			});
		},
		Stop: function()
		{
		},
		Next: function()
		{
			return $http.get('http://' + server + '/command?Command=921' + rand()).then(function(response)
			{
			    var results = response.data;
				 return results;
			});
		},
		Prev: function()
		{
		},
		SkipTo: function(time)
		{
			waitForIt = true;
			return $http.get('http://' + server + '/command?Command=GoTo&position=' + time + rand()).success(function()
			{
				console.log("Success");
			}).then(function(response)
			{
				waitForIt = false;
			    var results = response.data;
				return results;
			});
			console.log("Skipping to " + time);
		},
		Volume:
		{
			Up: function()
			{
			},
			Down: function()
			{
			},
			Set: function(value)
			{
				waitForIt = true;
				return $http.get('http://' + server + '/command?Command=Volume&val=' + value + rand()).then(function(response)
				{
					waitForIt = false;
					var results = response.data;
					return results;
				});
			}
		}
	}
	
	mpcFactory.player = 
	{
		Status: function()
		{
			if (waitForIt)
				return;
			return $http.get('http://' + server + '/command?Command=Status' + rand()).then(function(response)
			{
				var results = response.data;
			    return results;
			});
		},
		FullScreen: function()
		{
			return $http.get('http://' + server + '/command?Command=830' + rand()).then(function(response)
			{
				var results = response.data;
			    return results;
			});
		},
		OpenFile: function(filePath)
		{
			waitForIt = true;
			return $http.get('http://' + server + '/command?Command=Open&FilePath=' + filePath.replace(/\\/g, '\\\\') + rand()).then(function(r)
			{
				waitForIt = false;
			});
		}
	}

	mpcFactory.browser =
	{
		GetContents: function(dir, types)
		{
			requestRunning = true;
			return $http.get('http://' + server + '/command?Command=GetContents&dir=' + dir + '&types=' + types.join(',') + rand()).then(function(response)
			{
				requestRunning = false;
				return response.data;
			});
		}
	}

	return mpcFactory;
});
function rand()
{
	return '&a=' + Math.random(0, 100);
}


