app.controller('mpcController', function($scope, MpcFactory)
{
	$scope.FileSearch = '';
	$scope.FileList = [];
	$scope.Screens = [];
	$scope.Screen = 0;
	$scope.NodeServer = getItem('NodeServer') || '192.168.1.xxx';
	$scope.NodePort = getItem('NodePort') || '8000';
	$scope.FavoritesList = (getItem('Favorites')) ? JSON.parse(getItem('Favorites')) : [];
	$scope.CWD = getItem('LastCWD') || "/";
	$scope.FileTypes = ['mkv', 'avi', 'mp4'];
	$scope.test="Test";
	$scope.LoadingFileList = true;
	$scope.FavoriteEdit = {};
	$scope.Opened = (getItem('Opened')) ? JSON.parse(getItem('Opened')) : [];
	$scope.Commands = 
	{
		Play: 887,
		Pause: 888,
		Stop: 890,
		PlayPause: 889,
		JumpBackLg: 903,
		JumpBackMed: 901,
		JumpFwdMed: 902,
		JumpFwdLg: 904,
		VolumeUp: 907,
		VolumeDown: 908,
		Fullscreen: 830,
		Mute: 909,
		AudioDelayMinus: 906,
		AudioDelayPlus: 905,
		NextFile: 922,
		PrevFile: 919,
		NextSubtitle: 953,
		PrevSubtitle: 954,
		ToggleSubtitle: 955,
		VidFrmNormal: 836,
		VidFrmStretch: 838,
		VidFrmInside: 839,
		VidFrmOutside: 840,
		Launch: 'Launch'
	}
	$scope.Command = function(command)
	{
		MpcFactory.Command(command);
	}

	$scope.Launch = function()
	{
		MpcFactory.Launch();
	}
	$scope.Close = function()
	{
		MpcFactory.Close();
	}

	$scope.GetBounds = function()
	{
		var promise = MpcFactory.GetBounds();
		promise.then(function(bounds)
		{
			$scope.Screens = bounds.data.split(',');
		});
	}
	$scope.ChangeScreen = function()
	{
		if ($scope.Screen == 0)
			$scope.Screen = 1;
		else
			$scope.Screen = 0;
		MpcFactory.ChangeScreen($scope.Screens[$scope.Screen]);
	}

	$scope.SaveSettings = function()
	{

		setItem('NodeServer', $scope.NodeServer);
		setItem('NodePort', $scope.NodePort);
		server = $scope.NodeServer + ':' + $scope.NodePort;
		if ($scope.FileList.length == 0)
		{
			$scope.GetFileList();
		}

	}




	$scope.PlayPause = function()
	{
		if ($scope.Status.status == 'Playing')
		{
			$scope.Status.status = 'Paused'; 
			$scope.Msg('Pause');
		}
		else
		{
			$scope.Status.status = 'Playing'; 
			$scope.Msg('Play');
		}
		$scope.Command($scope.Commands.PlayPause);
	}

	$scope.GetFileList = function()
	{
		$scope.LoadingFileList = true;
		setItem('LastCWD', $scope.CWD);

		var promise = MpcFactory.browser.GetContents($scope.CWD, $scope.FileTypes);
		promise.then(function(contents)
		{
			$scope.FileList = contents;
			$scope.FileList.forEach(function(file)
			{
				file.modified = new Date(file.modified);
			});

			var folders = $scope.CWD.split('\\');
			var path = '';
			$scope.FolderList = [];
			if (folders.length > 0 && folders[0] != '\/')
			{
				for (var i = 0; i < folders.length; i++)
				{
					if (folders[i] != '')
					{
						path += folders[i] + '\\';
						$scope.FolderList.push( {name: folders[i], path: path.TrimTrailingSlash()});
					}
				}
			}
			$scope.LoadingFileList = false;
		});
	}

	$scope.setTime = function(time)
	{
		MpcFactory.controls.SkipTo(time);
	}
	$scope.setVolume = function(volume)
	{
		MpcFactory.controls.Volume.Set(volume);
	}
	$scope.NudgeVolume = function(which)
	{
		if (which == 'up')
		{
			$scope.Msg('Volume Up');
			if ($scope.Status.volume <= 95)
				$scope.Status.volume += 5;
			else
				$scope.Status.volume = 100;
		} else
		{
			$scope.Command($scope.Commands.VolumeDown);
			$scope.Msg('Volume Down');
			if ($scope.Status.volume >= 5)
				$scope.Status.volume -= 5;
			else
				$scope.Status.volume = 0;
		}
		$scope.setVolume($scope.Status.volume);
		$("#VolumeSlider").slider({value: $scope.Status.volume});
	}



	$scope.OpenFile = function(path)
	{
		MpcFactory.player.OpenFile(path);
		$scope.Opened.push(path);
		setItem('Opened', JSON.stringify($scope.Opened));
	}
	$scope.UpdateStatus = function()
	{
		var promise = MpcFactory.player.Status();
		if (!promise)
			return;
		promise.then(function(status)
		{
			if (sliding)
				return;
			$scope.Status = status;
			var totalSeconds = timeToSeconds(status.totalTime);
			var currentSeconds = timeToSeconds(status.currentTime);
			$("#SeekSlider").slider({max: totalSeconds, value: currentSeconds});
			$("#VolumeSlider").slider({value: status.volume});
			if (!$scope.Opened.contains(status.filePath) && status.status != 'N/A')
			{
				$scope.Opened.push(status.filePath);
				setItem('Opened', JSON.stringify($scope.Opened));
			}

		});
	}

	$scope.UpdateStatus();
	$scope.StatusInterval = setInterval(function()
	{
		$scope.UpdateStatus();
	}, 1000);
	$scope.FileClick = function(file)
	{
		if (typeof(file) == 'string' || file.type == 'favorite')
		{
			var path = file.path || file;
			if (path == '..')
			{
				if ($scope.CWD.indexOf('\\') > -1)
				{
					$scope.CWD = $scope.CWD.substring(0, $scope.CWD.lastIndexOf('\\'));
				} else
				{
					$scope.CWD = '/';
				}
				$scope.GetFileList();
			} else
			{
				//full path
				if (file.type && file.type == 'favorite')
				{
					if ($("#Phone").is(":visible"))
						$("a[href='#Browse']").click();
					else
						$("a[href='#Controls']").click();
				}

				$scope.CWD = path;
				$scope.GetFileList();
			}

		} else
		{
			if (file.type == 'file')
			{
				browseScroll = $(".tab-content").scrollTop();
				tabletBrowseScroll = $("#Browse").scrollTop();
				var filepath = $scope.CWD + '\\' + file.name;
				$scope.Status.fileName = file.name;
				$scope.OpenFile(filepath)
				$("a[href='#Controls']").click();
			} else if (file.type == 'directory' || file.type == 'favorite')
			{
				$scope.CWD = $scope.CWD + '\\' + file.name;
				$scope.GetFileList();
				$scope.FileSearch = '';
				hideSearch();
			} else if(file.type == 'drive')
			{
				$scope.CWD = file.name;
				$scope.GetFileList();
			}

		}
		if ($scope.CWD[$scope.CWD.length - 1] == '\\')
			$scope.CWD = $scope.CWD.substring(0, $scope.CWD.length - 1);
	}
	$scope.FileIcon = function(file)
	{
		if (file.type == 'directory')
		{
			return 'icon-folder-close-alt';
		} else if (file.type == 'drive')
		{
			return 'icon-hdd';
		} else
		{

			for (var i = 0; i < $scope.Opened.length; i++)
			{
				if ($scope.Opened[i] == $scope.CWD + '\\' + file.name || $scope.Opened[i] == $scope.CWD + file.name)
				return 'icon-film viewed';
			}

			return 'icon-film';
		}
	}
	$scope.FileSort = function(sort)
	{
		//TODO: call GetFileList with sort parameter to sort on the server
		$scope.fileSort = sort;
		$(".tab-content").scrollTop(0);
		$("#Browse").scrollTop(0);
	}

	$scope.PlayPauseIcon = function()
	{
		if ($scope.Status && $scope.Status.status == 'Playing')
			return "icon-pause";
		else
			return "icon-play";
	}

	$scope.Filter = function(which)
	{
		var file = { type: '', name: $scope.FileSearch };
		if ($scope.CWD == '/')
		{
			if (which == 'top')
			{
				file.type = '';
				return file;
			}
			else
			{
				//Don't show the bottom one because it'll repeat the list of drives
				file.type =  'flooglehorn';
				return file;
			}
		}

		if ($scope.fileSort == '-modified')
		{
			//Show files before directores
			if (which == 'top')
			{
				file.type =  'file';
				return file;
			} else
			{
				file.type =  'directory';
				return file;
			}
		} else
		{
			if (which == 'top')
			{
				file.type =  'directory';
				return file;
			} else
			{
				file.type =  'file';
				return file;
			}
		}
	}
	$scope.Favorites = {
		Add: function()
		{
			var thisFolder = $scope.FolderList[$scope.FolderList.length - 1];
			var folderName = thisFolder.name;
			if (folderName[folderName.length - 1] == '\\')
				folderName = folderName.substring(0, folderName.length - 1);
			var name = prompt("Enter a name for this entry", folderName);
			if (name)
			{
				var fav = { name: name, path: thisFolder.path, type: 'favorite'};
				$scope.FavoritesList.push(fav);
				setItem('Favorites', JSON.stringify($scope.FavoritesList));
			}
		},
		Edit: function(favorite)
		{
			$scope.FavoriteEdit = $.extend({}, favorite, true);
		},
		Update: function()
		{
			$scope.FavoritesList.forEach(function(favorite)
			{
				if (favorite.path == $scope.FavoriteEdit.path)
				{
					
					favorite.name = $scope.FavoriteEdit.name;
					return;
				}
			});
			setItem('Favorites', JSON.stringify($scope.FavoritesList));
			$("#FavoriteEditModal").find(".close:first").click();
		},
		Exists: function()
		{
			var result = false;
			for (var i = $scope.FavoritesList.length - 1; i >= 0; i--)
				if ($scope.FavoritesList[i].path == $scope.CWD || $scope.FavoritesList[i].path == $scope.CWD + '\\')
					return true;
			return false;
		},
		Remove: function(path)
		{
			if (!path)
				path = $scope.CWD;
			$scope.FavoritesList.forEach(function(favorite, index)
			{
				if (favorite.path == path)
				{
					$scope.FavoritesList.splice(index, 1);
					setItem('Favorites', JSON.stringify($scope.FavoritesList));
					return;
				}
			});
		}
	};


	var msgTimeout;
	var fading = false;
	$scope.Msg = function(msg)
	{
		if (msgTimeout)
			clearTimeout(msgTimeout);
		$("#Message").html(msg);
		if (fading)
			$("#Message").hide();
		$("#Message").stop().fadeIn('fast');
		msgTimeout = setTimeout(function()
		{
			fading = true;
			$("#Message").stop().fadeOut('fast', function()
			{
				fading = false;
			});

		}, 1000);
	}

	$scope.ClearOpened = function()
	{
		$scope.Opened = [];
		setItem('Opened', '');
	}
	$scope.ClearFavorites = function()
	{
		$scope.Favorites = [];
		setItem('Favorites', '');
	}

	$scope.ScrollToTop = function()
	{
		$(".tab-content").scrollTop(0, 0);
		$("#Browse").scrollTop(0, 0);
		browseScroll = 0;
		tabletBrowseScroll = 0;
	}

	$scope.Log = function(msg)
	{
		console.log(msg);
	}


	//TODO: only do this on non-phone devices
	$scope.GetFileList();
	$scope.GetBounds();

});

Array.prototype.contains = function(value)
{
	for (var i = this.length - 1; i >= 0; i--)
		if (this[i] == value)
			return true;
	return false;
}

String.prototype.TrimTrailingSlash = function()
{
	if (this[this.length - 1] == '\\')
		return this.substring(0, this.length - 1);
	return this;
}



