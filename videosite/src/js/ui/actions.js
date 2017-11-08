var Actions = function () { };

Actions.prototype = function () {
	var presentedTemplate = "";
	var showPage = function (template, params) {
			var target = "page";
			var reverse = false;
			var transitionTime = 50;
			var ease = "swing";
			var animOpacity = 0;
			var animLeft = 0;
			var animTop = 0;
			var animScale = 1;
			var callBack;

			var $popup;
			var popupTarget;

			if (params) {
				if (params.target) target = params.target;
				if (params.reverse) reverse = params.reverse;
				if (params.time) transitionTime = params.time * 1000;
				if (params.ease) ease = params.ease;
				if (params.opacity) animOpacity = params.opacity;
				if (params.left) animLeft = params.left;
				if (params.top) animTop = params.top;
				if (params.scale) animScale = params.scale;
				if (params.cb) callBack = params.cb;
			}

			if (presentedTemplate == template) {
				destroyContents(document.getElementById(target));
			} else {
				presentedTemplate = template;
			}

			var $content = content.processPage( $templates.find("#" + template).children().clone() );
			var $page = $("#" + target);
			var $pageContainer = $page.parent();

			$("#modal").show();

			//$("footer").fadeOut();
			if (transitionTime > 0) {
				if (reverse) {
					destroyContents(document.getElementById("transition"));
					$("#transition").stop().show().css({ opacity: 1, left: 0, top: 0 });
					$("#transition").html($page.children());
					var transitionObj = {};
					if (animOpacity != 1) transitionObj.opacity = animOpacity;
					if (animLeft != 0) transitionObj.left = animLeft;
					if (animTop != 0) transitionObj.top = animTop;
					if (animScale != 1) {
						$("#transition").css({ transform: 'scale(1)' });
						transitionObj.transform = 'scale(' + animScale + ')';
					}

					$("#transition").animate(transitionObj, {
						duration: transitionTime,
						easing: ease,

						complete: function () {
							destroyContents(document.getElementById("transition"));
							$("#modal").hide();
						}
					});


					//destroyContents(document.getElementById(target));
					$page.css({ opacity: 0 });
					$page.html($content);
					$page.stop().animate({
						opacity: 1
					}, {
						duration: transitionTime / 1.5,

						//complete: function () {
						//	content.resumeAutoPlay($page);
						//}
					});


				} else {
					var animDelay = 0;
					var animObj = {
						opacity: 1//0.85
					}

					if (location.hash == "#destinations") {
						animDelay = 500;
						animObj = {
							opacity: 1,
							top: -animTop
						}
					}

					$page.stop().animate(animObj, {
						duration: transitionTime / 1,
						easing: ease,

						complete: function () {


						}
					});

					destroyContents(document.getElementById("transition"));
					$("#transition").stop().show().css({ opacity: animOpacity, left: animLeft, top: animTop });

					$("#transition").html($content);

					var transitionObj = {};
					if (animOpacity != 1) transitionObj.opacity = 1;
					if (animLeft != 0) transitionObj.left = 0;
					if (animTop != 0) transitionObj.top = 0;
					if (animScale != 1) {
						$("#transition").css({ transform: 'scale(' + animScale + ')' });
						transitionObj.transform = 'scale(1)';
					}

					$("#transition").animate(transitionObj, {
						duration: transitionTime,
						easing: ease,

						complete: function () {
							//console.log("destroying old page (step 1)", target, template);
							destroyContents(document.getElementById(target));
							window.scrollTo(0, 0);
							$page.css({ opacity: 1, top:0 });

						    //console.log("populating the new  page (step 2)");
						    var focusElem = document.activeElement;
						    $page.html($("#transition").children());
						    if (focusElem && utils.environmentTest() != "ie") focusElem.focus();
						    $("#transition").hide();
						    if (callBack) callBack();
						    //$("footer").fadeIn();
						    //setupBlur($pageContainer);

						    $("#modal").hide();
						    content.resumeAutoPlay($page);
						}
					});
				}
			}
			else {
				destroyContents(document.getElementById(target));
				$page.stop().css({ opacity: 1 });
				$page.html($content);
				if (callBack) callBack();

				content.processPage($page);
			}
		},

		closePage = function (params) {
			//console.log("closePage", params );
			var delay = 0;
			if (params.delay) delay = params.delay * 1000;

			var $elem = $("#" + params.target);

			var origOpacity = $elem.css("opacity");
			$elem.stop(true, true).delay(delay).animate({ opacity: 0 }, 400, 'swing', function () { destroyContents(this, origOpacity); });
			//.fadeOut( function() { destroyContents(this, true); });
		},

		showPopup = function (template, params) {
			popupTarget = "popup";
			var top = 0;	//
			var title, image, description;
			//console.log("show popup function called");
			if (params) {
				if (params.target) popupTarget = params.target;
				if (params.top) top = params.top;
				if (params.modalColor) color = params.color;
				if (params.modalOpacity) opacity = params.opacity;
			}

			//console.log(popupTarget)

			var $content = content.processPage( $templates.find("#" + template).children().clone() );
			$popup = $("#" + popupTarget);

			destroyContents(document.getElementById(popupTarget));

			$popup.stop().css({ opacity: 1 });
			$popup.html($content);

			$popup.bPopup({
				easing: 'easeOutExpo', //uses jQuery easing plugin
				speed: 500,
				//transition: 'slideBack'
				positionStyle: 'absolute',
				position: [ 'auto', top ],
				opacity: 0,//.2,
				follow: [false, false], //x, y
				modalColor: '#000',
				closeClass: 'b-close',
				modalClose: true,
				onClose: function () {
					destroyContents(document.getElementById(popupTarget));
					//content.empty();
				}
			});

			content.resumeAutoPlay($popup);

			//if (callBack) callBack();
		},

		closePopup = function (params) {
			//$popup.close();
			popupTarget = "popup";
			if (params) {
				if (params.target) popupTarget = params.target;
			}

			console.log(popupTarget);
			var bPopup = $("#" + popupTarget).bPopup();
			bPopup.close();
			destroyContents(document.getElementById(popupTarget));
		},

		setStyle = function ($elem, params) {
			var target;

			var time = 0;
			if (params.time) time = params.time * 1000;

			var delay = 0;
			if (params && params.delay) delay = params.delay * 1000;

			var ease = "swing";
			if (params && params.easing) ease = params.easing;

			if (params.target == "this") {
				target = $elem;
			}
			else if (params.target == "item") {
				target = $elem.item;
				//console.log("ITEM TARGET", target)
			}
			else {
				target = $("#" + params.target);
			}

			if (params.stop == "true") target.stop(true, true)

			if (time == 0) {
				target.delay(delay).css(params);
			}
			else {
				target.delay(delay).animate(params, {
					duration: time,
					easing: ease,
					complete: function () {
						//console.log("iSIT?", target, target.parent(), target.parent().masonry);
					}
				});
			}
		},

		dragMe = function ($elem, params) {
			params.stack = "#" + $elem.parent().attr("id") + " div"; // makes the draggable div element come out on in front of all the div elements in the parent container
			$elem.draggable(params);
		},

		dropHere = function ($elem, params) {
			//console.log("ACCEPT", params.accept)
			if (params.accept.charAt(0) == "'") params.accept = params.accept.slice(1, -1) // if there are quotes, remove them
			var accepted = params.accept.split(",");
			for (var i = 0; i < accepted.length; i++) {
				if (accepted[i].charAt(0) != "#" && accepted[i].charAt(0) != ".") accepted[i] = "#" + accepted[i];
			}

			$elem.droppable({
				accept: accepted.join(","),
				activeClass: params.activeClass,
				hoverClass: params.hoverClass,
				drop: function (event, ui) {
					var $el = $(this);
					$el.item = ui.draggable;
					if (!$el.data("droppedItems")) $el.data("droppedItems", []);
					var droppedArray = $el.data("droppedItems");
					droppedArray.push(ui.draggable.attr("id"));
					$el.data("droppedItems", droppedArray);

					if ($el.attr("data-actions-dropped-valid")) {
						var dadv = $el.attr("data-actions-dropped-valid").split(";");
						performActions($el, dadv);
					}
					ui.draggable.draggable("disable");
					ui.draggable.css("cursor", "default");
					ui.draggable.removeClass("ui-state-disabled");

					if (accepted.length == droppedArray.length) {
						$(this).addClass(params.doneClass)
						var dadd = $el.attr("data-actions-dropped-done").split(";");
						performActions($el, dadd);
					}
				}
			});
		},

		destroyContents = function (elem, restoreOpacityTo) { // to defeat asset removal memory leak which still appears in Chrome and Safari as of 12. Dec. 2013
			//console.log("DESTROY ELEM", elem)
			var videos = elem.getElementsByTagName("video");
			if (videos && videos.length > 0) {
				for (var i = 0; i < videos.length; i++) {
					videos[i].src = "";

					var sources = videos[i].getElementsByTagName("source");
					if (sources && sources.length > 0) {
						for (var j = 0; j < sources.length; j++) {
							sources[j].src = "";
						}
					}
					videos[i].load();
				}
			}

			var images = elem.getElementsByTagName("img");
			if (images && images.length > 0) {
				for (var k = 0; k < images.length; k++) {
					images[k].src = "";
				}
			}

			$(elem).find("*").css("background-image", "url('')");


			$(elem).find("*").each(function () {
				if ($(this).data("ui-slider")) {
					//console.log("destroying slider");
					$(this).slider("destroy");
				}
				$(this).off();
				$(this).stop(true, true);
				//if ($(this).hammer() ) $(this).hammer().off();
				$(this).removeData();
			});
			$(elem).off();
			$(elem).stop(true, true);
			//if ($(elem).hammer() ) $(elem).hammer().off();
			$(elem).removeData();

			//$(elem).empty(); // causes a memory leak when removing nodes even when all of the above is done.
			elem.innerHTML = ""; // doesn't cause a memory leak...
			if (restoreOpacityTo != undefined) $(elem).css("opacity", restoreOpacityTo);
			//elem.parentNode.removeChild(elem);
		},

        setupBlur = function ($elem) {
        	/*$($elem).blurjs({
                source: 'body',     //Background to blur
                radius: 30,          //Blur Radius
                overlay: 'rgba(244,244,244, .8)',        //Overlay Color, follow CSS3's rgba() syntax
                offset: {           //Pixel offset of background-position
                    x: 500,
                    y: 150
                },
                optClass: '',                   //Class to add to all affected elements
                cache: false,                   //If set to true, blurred image will be cached and used in the future. If image is in cache already, it will 	be used.
                cacheKeyPrefix: 'blurjs-',      //Prefix to the keyname in the localStorage object
                draggable: false                //Only used if jQuery UI is present. Will change background-position to fixed
            });*/
        }

	return {
		showPage: showPage,
		showPopup: showPopup,
		closePopup: closePopup
	};
}();
