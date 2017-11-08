var Utils = function () {
	this.isiPad = navigator.userAgent.match(/iPad/i) != null;
	this.isAndroid = /(android)/i.test(navigator.userAgent);
};

Utils.prototype = function() {
	var formatLocalDate = function () {
			var now = new Date(),
				tzo = -now.getTimezoneOffset(),
				dif = tzo >= 0 ? '+' : '-',
				pad = function(num) {
					var norm = Math.abs(Math.floor(num));
					return (norm < 10 ? '0' : '') + norm;
				};
			return now.getFullYear()
				+ '-' + pad(now.getMonth() + 1)
				+ '-' + pad(now.getDate())
				+ 'T' + pad(now.getHours())
				+ ':' + pad(now.getMinutes())
				+ ':' + pad(now.getSeconds());
				//+ dif + pad(tzo / 60) 
				//+ ':' + pad(tzo % 60);
		},

		environmentTest = function () {
		    var envStr = "",
				standalone = window.navigator.standalone,
				userAgent = window.navigator.userAgent.toLowerCase(),
				safari = /safari/.test(userAgent),
				ios = /iphone|ipod|ipad/.test(userAgent),
			    msie = userAgent.indexOf("MSIE ");

		    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
		        envStr = "ie";
		    }
		    else if (ios) {
		        if (!standalone && safari) {
		            //browser
		            envStr = "safari";
		        } else if (standalone && !safari) {
		            //standalone
		            envStr = "standalone";
		        } else if (!standalone && !safari) {
		            //uiwebview
		            envStr = "webview";
		        };
		    } else if (this.isAndroid) {
		        envStr = "webview";
		    } else {
		        //not iOS
		        envStr = "not_ios";
		    };
		    return envStr;
		},

		getParameterByName = function (name, win) {
			name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
			var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
				results = regex.exec(win.location.search);
			return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
		},

		getWindowHeight = function (usePixelRatio) {
			if (!window.devicePixelRatio) {
				window.devicePixelRatio = 1;
			}

			var h = 0;

			if (environmentTest() == "webview") {
				h = (usePixelRatio != false) ? window.screen.width * window.devicePixelRatio : window.screen.width;
			}
			else {
				h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
			}

			return h;
		},

		detectIE = function () {
			var ua = window.navigator.userAgent;

			var msie = ua.indexOf('MSIE ');
			if (msie > 0) {
				// IE 10 or older => return version number
				return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
			}

			var trident = ua.indexOf('Trident/');
			if (trident > 0) {
				// IE 11 => return version number
				var rv = ua.indexOf('rv:');
				return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
			}

			var edge = ua.indexOf('Edge/');
			if (edge > 0) {
				// Edge (IE 12+) => return version number
				return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
			}

			// other browser
			return false;
		}

	return {
		formatLocalDate: formatLocalDate,
		environmentTest: environmentTest,
		getParameterByName: getParameterByName,
		getWindowHeight: getWindowHeight,
		detectIE: detectIE
	};
} ();
