$.fn.isVisible = function ()
{
	return $(this).css("display") != "none";
}
function showWindow(window, callback)
{
	$("#bg").show();
	$(window).show();
	centerThings();
	$("#bg").click(function ()
	{
		hideWindows();
	});
	if (callback)
	    callback();
    $("body").on("click", ".close", function (e)
	{
	    e.preventDefault();
	    hideWindows();
	});
}
function hideWindows(callback)
{
	$("#bg").hide();
	$(".window").hide().css('width', '');
	if (typeof (hideTooltip) == "function")
	    hideTooltip();
	$("#SpinnerIcon").remove();
	if (typeof (getProductRequests) != 'undefined')
	{ //Stop loading product details if the window is closed
		for (var i = 0; i < getProductRequests.length; i++)
			getProductRequests[i].abort();
		getProductRequests = [];
	}
	if (callback) callback();
}
function centerThings()
{
	$(".window").filter(function (e, elem)
	{
		return $(elem).css("display") === 'block';
	}).each(function ()
	{
		var posLeft = ($(window).width() / 2) - ($(this).outerWidth() / 2);
		var posTop = ($(window).height() / 2) - ($(this).outerHeight() / 2);
		if ($(window).height() < $(this).outerHeight()) posTop = 0; //Stick to the top of the page if resized too small
		$(this).css("left", posLeft).css("top", posTop);
	});
}
function setCookie(c_name, value, exdays)
{
	var exdate = new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value = escape(value) + ((exdays == null) ? '' : "; expires=" + exdate.toUTCString());
	document.cookie = c_name + "=" + c_value;
}
function getCookie(c_name)
{
	var i, x, y, ARRcookies = document.cookie.split(";");
	for (i = 0; i < ARRcookies.length; i++)
	{
		x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
		y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
		x = x.replace(/^\s+|\s+$/g, '');
		if (x == c_name)
		{
			return unescape(y);
		}
	}
}
function roundNumber(num, dec)
{
    return Math.round(Math.round(num * Math.pow(10, dec + 1)) / Math.pow(10, 1)) / Math.pow(10, dec);
}
function FormatCurrency(float)
{
	float = roundNumber(float, 2);
	var all = [];
	var str = float.toString().split('.')[0].replace('-', '').toString();
	var dec = (float.toString().indexOf('.') > -1) ? dec = float.toString().split('.')[1] : '00';
	var neg = (float.toString().indexOf('-') == 0);
	dec += (dec.length == 1) ? '0' : '';
	for (var i = str.length - 1; i >= 0; i -= 3)
	{
		var allString = '';
		if (i > 2)
		{
			allString = str.charAt(i) + str.charAt(i - 1) + str.charAt(i - 2);
		} else
		{
			for (var q = i; q >= 0; q--)
				allString += str.charAt(q);
		}
		all.push(allString);
	}
	for (var i = 0; i < all.length; i++)
	{
		all[i] = all[i].reverse();
	}
	var dollars = '$' + (neg ? '-' : '') + all.reverse().join(',') + '.' + dec.toString();
	return dollars;
}
function reverseStr(str)
{
	var output = "";
	for (var i = str.length; i >= 0; i--)
		output += str[i];
	return output;
}
function Timer()
{
	var startTime = {};
	var endTime = {};
	this.start = function ()
	{
		startTime = new Date();
		return this; //for chaining
	}
	this.stop = function ()
	{
		endTime = new Date();
	}
	this.elapsed = function ()
	{
		return parseInt((endTime - startTime).toString());
	}
	return this;
}
function getQueryString(key)
{
    var result = {},
        queryString = location.search.substring(1),
        re = /([^&=]+)=([^&]*)/gi, m;

	while (m = re.exec(queryString))
	{
		result[decodeURIComponent(m[1]).toLowerCase()] = decodeURIComponent(m[2]);
	}
	return result[key.toLowerCase()];
}
function htmlEscape(str)
{
	return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}
window.requestAnimFrame = (function ()
{
	return window.requestAnimationFrame ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame ||
              window.oRequestAnimationFrame ||
              window.msRequestAnimationFrame ||
              function (callback)
              {
              	window.setTimeout(callback, 1000 / 60);
              };
})();


function CartContents(workspaceId, etilizeLookup, callback)
{
	if (typeof (workspaceId) != 'string')
	{
		callback = workspaceId;
		workspaceId = "";
	}
	$.ajax({
		url: "/webmethods.aspx/CartContents",
		data: JSON.stringify({ WorkspaceID: workspaceId, EtilizeLookup: etilizeLookup }),
		type: "POST",
		dataType: "json",
		contentType: "application/json; charset=utf-8",
		success: function (result)
		{
			var cart = JSON.parse(result.d);
			callback(cart);
		}
	});
}

function Item()
{
	this.ItemID = "";
	this.EtilizeID = "";
	this.LineID = "";
	this.Description = "";
	this.EtilizeShortDescription = "";
	this.EtilizeLongDescription = "";
	this.CustomerPrice = "";
	this.StandardCost = "";
	this.UOM = "";
	this.Valid = false;
	this.Qty = 0;
	this.Total = "";
}

function showMenu(menuUl, button)
{
	var currentlyOpen = (menuUl.css("display") === "block") ? true : false;
	hideMenus();
	if (!currentlyOpen)
	{
		function positionDropdown()
		{
			currentlyOpen = (menuUl.css("display") === "block");
			var top = $(button).offset().top + $(button).outerHeight();
			var left = $(button).offset().left;
			var width = 0;
			if (!currentlyOpen) menuUl.show();
			$(menuUl).children().each(function ()
			{
				if (parseInt($(this).outerWidth()) > width) { width = parseInt($(this).outerWidth()); }
			});

			//See if we need to make it inward or outward
			$(menuUl).css({ 'top': top - 1, 'left': left, 'width': (width) + 'px !important;', 'height': 'auto' });

			if ($(menuUl).offset().left + $(menuUl).outerWidth(true) > $(window).outerWidth(true))
			{
				left = left - $(menuUl).outerWidth(true);
				$(menuUl).css('left', left);
			}
			if (!currentlyOpen) $(menuUl).hide();
		}
		positionDropdown();
		menuUl.show();
		$(button).css('opacity', '1');
		setTimeout(function () { positionDropdown(); setTimeout(function () { positionDropdown(); }, 500); }, 500);
		$(window).resize(function ()
		{
			positionDropdown();
		});
	    //$(button).css("backgroundColor", "#f4f4f4 !important");
	}
}
function hideMenus()
{
    $(".dropdownMenu").hide();
    //$(".menuButton").css("backgroundColor", "#fff !important");
}
$(function ()
{
	$(document).click(function (e)
	{
		var elem = e.srcElement || e.target;
		if (!($(elem).parents(".menuButton").length > 0 || $(elem).hasClass('menuButton')) && !($(elem).hasClass("blank")))
		{
			hideMenus();
		}
	});
});

function showLoginPopup(text, callback)
{
	var loginWindow = $("#LoginWindow");
	position(loginWindow);
	$(loginWindow).show();
	$("#LoginBG").show();
	var returnTo = location.href;
	returnTo = returnTo.replace(new RegExp('&', 'g'), '*amp*');
	$("#ReturnTo").val(returnTo);
	$(loginWindow).wrapInner($("<form>").attr({ 'method': 'get', 'action': '/login.aspx' }));
	if (callback)
		callback();
	$(window).bind("resize", function ()
	{
		position(loginWindow);
	});
	function position(element)
	{
		var posLeft = ($(window).width() / 2) - ($(element).outerWidth() / 2);
		var posTop = ($(window).height() / 2) - ($(element).outerHeight() / 2);
		if ($(window).height() < $(element).outerHeight())
			posTop = 0;
		$(element).css("left", posLeft).css("top", posTop);
	}
}
function hideLoginWindow()
{
	$("#NotLoggedInBG").fadeOut("fast");
	$("#NotLoggedIn").fadeOut("fast");
}

function UpdateItemQty(LineID, Qty, Price, callback, type, lineNo)
{
	if (!type)
	{
		type = "", lineNo = "";
	}
	$.ajax({
		url: "/webmethods.aspx/Cart_UpdateQty",
		type: "POST",
		dataType: "json",
		data: JSON.stringify({
			LineID: LineID
			, Qty: Qty
			, Price: Price
			, LineNo: lineNo
			, Type: type
		}),
		contentType: "application/json; charset=utf-8",
		success: function (result)
		{
			var Cart = JSON.parse(result.d);
			if (callback)
				callback(Cart);
		}
	});
}
function UpdateItemQtyPrice(LineID, Qty, Price, callback)
{
	$.ajax({
		url: "/webmethods.aspx/Cart_UpdateQtyPrice",
		type: "POST",
		dataType: "json",
		data: JSON.stringify({ LineID: LineID, Qty: Qty, Price: Price }),
		contentType: "application/json; charset=utf-8",
		success: function (result)
		{
			if (callback)
				callback();
		}
	});
}
String.prototype.reverse = function () { return this.split("").reverse().join(""); }
String.prototype.trim = function () { return this.replace(/^\s+|\s+$/g, ''); }
if (!Array.prototype.forEach)
{

	Array.prototype.forEach = function (callback, thisArg)
	{

		var T, k;

		if (this == null)
		{
			throw new TypeError(" this is null or not defined");
		}

		// 1. Let O be the result of calling ToObject passing the |this| value as the argument.  
		var O = Object(this);

		// 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".  
		// 3. Let len be ToUint32(lenValue).  
		var len = O.length >>> 0; // Hack to convert O.length to a UInt32  

		// 4. If IsCallable(callback) is false, throw a TypeError exception.  
		// See: http://es5.github.com/#x9.11  
		if ({}.toString.call(callback) != "[object Function]")
		{
			throw new TypeError(callback + " is not a function");
		}

		// 5. If thisArg was supplied, let T be thisArg; else let T be undefined.  
		if (thisArg)
		{
			T = thisArg;
		}

		// 6. Let k be 0  
		k = 0;

		// 7. Repeat, while k < len  
		while (k < len)
		{

			var kValue;

			// a. Let Pk be ToString(k).  
			//   This is implicit for LHS operands of the in operator  
			// b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.  
			//   This step can be combined with c  
			// c. If kPresent is true, then  
			if (k in O)
			{

				// i. Let kValue be the result of calling the Get internal method of O with argument Pk.  
				kValue = O[k];

				// ii. Call the Call internal method of callback with T as the this value and  
				// argument list containing kValue, k, and O.  
				callback.call(T, kValue, k, O);
			}
			// d. Increase k by 1.  
			k++;
		}
		// 8. return undefined  
	};
}

Array.range= function(a, b, step){
    var A= [];
    if(typeof a== 'number'){
        A[0]= a;
        step= step || 1;
        while(a+step<= b){
            A[A.length]= a+= step;
        }
    }
    else{
        var s= 'abcdefghijklmnopqrstuvwxyz';
        if(a=== a.toUpperCase()){
            b=b.toUpperCase();
            s= s.toUpperCase();
        }
        s= s.substring(s.indexOf(a), s.indexOf(b)+ 1);
        A= s.split('');        
    }
    return A;
}
$.fn.blinkText = function(text, duration)
{
	if (!duration)
		duration = 1000;
	var that = this;
	$(this).html(text);
	setTimeout(function()
	{
		$(that).html($(that).data("text"));
	}, duration);
}
