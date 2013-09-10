var app = angular.module('MPCRemote', ['ui', 'ui.filters', 'ui.directives', 'ui.bootstrap']);
app.config(['$httpProvider', function($httpProvider)
{

	//$httpProvider.defaults.useXDomain = true;
	//delete $httpProvider.defaults.headers.common['X-Requested-With'];
}]);

var sliding = false,
	browseScroll = 0,
	tabletBrowseScroll = 0,
	updateInterval,
	slidingValue,
	scope;
$(function()
{
	$("#PlayPause").click(function(e)
	{
		e.preventDefault();
	});

	$('#SeekSlider').slider({
		min:0,
		max:1000,
		value:0,
		range: 'min',
		orientation: "horizontal",
		start: function(event, ui)
		{
			scope = angular.element($("#CurrentTime")).scope();
			sliding = true;
			updateInterval = setInterval(function()
			{
				var time = secondsToTime(slidingValue);
				scope.setTime(time.toString());
			}, 500);
		},
		stop: function()
		{
			sliding = false;
			if (updateInterval)
				clearInterval(updateInterval);
		},
		change: function(event, ui) {
			if (sliding)
				return;
			if (event.button == 0)
			{
				scope.$apply(function()
				{
					var time = secondsToTime(ui.value);
					scope.Status.currentTime = time.toString();
					scope.setTime(scope.Status.currentTime);
				});
			}
		},
		slide: function(event, ui)
		{
			slidingValue = ui.value;
			var time = secondsToTime(ui.value);
			$("#CurrentTime").html(time.toString());
		}
	});
	$('#VolumeSlider').slider({
		min:0,
		max:100,
		value:50,
		range: 'min',
		orientation: "horizontal",
		start: function(event, ui)
		{
			scope = angular.element($("#CurrentTime")).scope();
			sliding = true;
			updateInterval = setInterval(function()
			{
				scope.setVolume(slidingValue);
			}, 500);
		},
		stop: function()
		{
			sliding = false;
			if (updateInterval)
				clearInterval(updateInterval);
		},
		change: function(event, ui) {
			if (sliding)
				return;
			if (event.button == 0)
			{
				scope.$apply(function()
				{
					scope.Status.volume = ui.value;
					scope.setVolume(ui.value);
				});
			}
		},
		slide: function(event, ui)
		{
			slidingValue = ui.value;
			$("#CurrentVolume").html(ui.value);
			//scope.$apply(function()
			//{
				//scope.Status.volume = ui.value;
			//});
		}
	});
	setTimeout(function()
	{
		$(".volumeControls a").show();
	}, 100);


	$("body").mouseup(function()
	{
		sliding = false;
	});

	$("a[data-toggle='tab']").click(function()
	{
		if ($(".tab-pane:visible").attr('id') == 'Browse')
		{
			browseScroll = $(".tab-content").scrollTop();
			tabletBrowseScroll = $("#Browse").scrollTop();
		}
	});


	$("a[data-toggle='tab']").on('shown', function(e)
	{
		if ($(e.target).attr('href') == '#Browse')
		{
			setTimeout(function()
			{
				$(".tab-content").scrollTop(browseScroll, 0);
				$("#Browse").scrollTop(tabletBrowseScroll, 0);
			}, 1);
		}

		$($(e.target).attr('href')).show();
		footer();
	});



	setTimeout(function()
	{
		footer();
		$("#SearchButton").click(function()
		{
			if ($(this).data("expanded"))
			{
				hideSearch();
			} else
			{
				$(this).data("expanded", true);
				$(".footer #RightButtons").hide();
				$("#FileSearch").show().focus()
				.animate({
					width: '136px'
				}, 100, function()
				{
					$("#ClearSearchButton").show();
				});
			}
		});
		$("#ClearSearchButton").click(function(e)
		{
			hideSearch();
		});
		$("#FileSearch").blur(function()
		{
			if ($(this).val() == '')
				hideSearch();
		});
	}, 50);
});

function hideSearch()
{
	$("#SearchButton").data("expanded", false);
	$("#FileSearch").animate({
		width: 0
	}, 100, function()
	{
		$(this).hide();
		$("#ClearSearchButton").hide();
		$(".footer #RightButtons").show();
	});
}
function footer()
{
	var activeTab = $('.nav-tabs li.active a').attr('href');
	if (activeTab == "#Browse" || ($("#Desktop").is(':visible') && activeTab == '#Controls'))
	{
		$(".footer").show();
		$(".tab-content").css('bottom', '35px');
	} else
	{
		$(".footer").hide();
		$(".tab-content").css('bottom', '0');
	}
}


function secondsToTime(secs)
{
	var hours = Math.floor(secs / (60 * 60));

	var divisor_for_minutes = secs % (60 * 60);
	var minutes = Math.floor(divisor_for_minutes / 60);

	var divisor_for_seconds = divisor_for_minutes % 60;
	var seconds = Math.ceil(divisor_for_seconds);

	hours = (hours.toString().length == 1) ? '0' + hours : hours;
	minutes = (minutes.toString().length == 1) ? '0' + minutes : minutes;
	seconds = (seconds.toString().length == 1) ? '0' + seconds : seconds;

	var obj = {
		"h": hours,
		"m": minutes,
		"s": seconds,
		toString: function()
		{
			return this.h + ':' + this.m + ':' + this.s;
		}
	};
	return obj;
}
function timeToSeconds(time)
{
	if (!time)
		return;
	var seconds = 0;
	var re = new RegExp(/(\d\d):(\d\d):(\d\d)/);
	var matches = re.exec(time);
	var hr = matches[1];
	var min = matches[2];
	var sec = matches[3];
	seconds += +hr * 60 * 60;
	seconds += +min * 60;
	seconds += +sec;
	return seconds;
}



function touchHandler(event)
{

	if (event.srcElement.className.indexOf('ui-slider-handle') > -1 || event.srcElement.className.indexOf('ui-slider') > -1)
	{
		//prevent the default for slider
		var touches = event.changedTouches,
		first = touches[0],
		type = "";
		switch (event.type)
		{
			case "touchstart": type = "mousedown"; break;
			case "touchmove": type = "mousemove"; break;
			case "touchend": type = "mouseup"; break;
			default: return;
		}
		var simulatedEvent = document.createEvent("MouseEvent");
		simulatedEvent.initMouseEvent(type, true, true, window, 1,
		first.screenX, first.screenY,
		first.clientX, first.clientY, false,
		false, false, false, 0/*left*/, null);
		first.target.dispatchEvent(simulatedEvent);
		event.preventDefault();
	}
}
function init()
{
	document.addEventListener("touchstart", touchHandler, true);
	document.addEventListener("touchmove", touchHandler, true);
	document.addEventListener("touchend", touchHandler, true);
	document.addEventListener("touchcancel", touchHandler, true);
}
init();
(function() {
	if ("-ms-user-select" in document.documentElement.style && navigator.userAgent.match(/IEMobile\/10\.0/)) {
		var msViewportStyle = document.createElement("style");
		msViewportStyle.appendChild(
			document.createTextNode("@-ms-viewport{width:auto!important}")
		);
		document.getElementsByTagName("head")[0].appendChild(msViewportStyle);
	}
})();
