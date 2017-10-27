var VideoPage = function() {};

VideoPage.prototype = function() {
	var setupPage = function() {
		console.log("VideoPage");
		actions.showPage("template-videoPage", {
			time: 1.5,
			opacity: 1,
			left: 0,
			top: 0,
			scale: 1,
			ease: "easeInOutQuint"
		});
		console.log(app.assetPath, vsrc)


					//videoLoad();
		      initialiseMediaPlayer();
					videoLoad();
					videoControls();

				videoLoad = function() {
					var vPath = videoAssetPath+'/'+videoSrc
					console.log(vPath);
					mediaPlayer.setAttribute('src', vPath);
		    }

		    //document.addEventListener("DOMContentLoaded", function() { initialiseMediaPlayer(); }, false);
		    var mediaPlayer;
		    var progressBar;
		    var btn;

		    initialiseMediaPlayer = function() {
		      mediaPlayer = document.getElementById('media-video');
		      progressBar = document.getElementById('progress-bar');
		      btn = document.getElementById('play-pause-button');
		      mediaPlayer.controls = false;

					//videoLoad();
		    }

		    videoControls = function() {
		      $('#play-pause-button').off("click").on("click", function(event) {
		        console.log('play');
		        togglePlayPause();
		        //$('#aBtnCloseSessionNo').off("click").on("click", function (event) {
		        //	actions.closePopup();
		        //});
		      });
		      $('#volume-inc-button').off("click").on("click", function(event) {
		        console.log('+');
		        changeVolume("+")
		      });
		      $('#volume-dec-button').off("click").on("click", function(event) {
		        console.log('-');
		        changeVolume("-")
		      });
		      $('#replay-button').off("click").on("click", function(event) {
		        console.log('replay');
		        replayMedia()
		      });
		      $('#fullscreen-button').off("click").on("click", function(event) {
		        console.log('fullscreen');
		        fullscreenMedia()
		      });

		      //$('#media-video').bind('timeupdate', updateProgressBar);
		      mediaPlayer.addEventListener('timeupdate', updateProgressBar, false);
		    }

		  	togglePlayPause = function() {
		      if (mediaPlayer.paused || mediaPlayer.ended) {
		        btn.title = 'pause';
		        btn.innerHTML = 'pause';
		        btn.className = 'pause';
		        mediaPlayer.play();
		      } else {
		        btn.title = 'play';
		        btn.innerHTML = 'play';
		        btn.className = 'play';
		        mediaPlayer.pause();
		      }
		    }

		    changeButtonType = function(btn, value) {
		      btn.title = value;
		      btn.innerHTML = value;
		      btn.className = value;
		    }

		    updateProgressBar = function() {
		      //var progressBar = document.getElementById('progress-bar');
						var percentage = Math.floor((100 / mediaPlayer.duration) *
							mediaPlayer.currentTime);
							//console.log(mediaPlayer.duration, percentage)
						progressBar.value = percentage;						//Uncaught TypeError: Failed to set the 'value' property on 'HTMLProgressElement': The provided double value is non-finite.
						progressBar.innerHTML = percentage + '% played';
		    }

		    changeVolume = function(direction) {
		      if (direction === '+') mediaPlayer.volume += mediaPlayer.volume == 1 ? 0 : 0.1;
		      else mediaPlayer.volume -= (mediaPlayer.volume == 0 ? 0 : 0.1);
		    }

		    replayMedia = function() {
		      resetPlayer();
		      mediaPlayer.play();
		    }

		    fullscreenMedia = function() {
		      mediaPlayer.webkitRequestFullScreen();
		    }

		    resetPlayer = function() {
		      progressBar.value = 0;
		      mediaPlayer.currentTime = 0;
		      //changeButtonType(playPauseBtn, 'play');
		    }
	}

	return {
		setupPage: setupPage
	};
}();
