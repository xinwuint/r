var Application = function() {
  this.assetPath = "";
  this.videoAssetPath = "";
};


Application.prototype = function() {
  var assetPath;
  var videoAssetPath;
  var listTitle;
  var footerText;
  var idleTime = 0;
  var idleMax;
  var goReverse = false;

  var startURL = window.location.href;

  var launch = function() {
      $('body').bind('touchstart', function() {});

      assetPath = dm.pageArray.defaults.imageAssetPath;
      videoAssetPath = dm.pageArray.defaults.videoAssetPath;
      listTitle = Pn.l10n.get(dm.pageArray.defaults.listTitle);
      footerText = Pn.l10n.get(dm.pageArray.defaults.footerText);

      idleDetection();
      reset();
      insertText();
      setupHamburger();
      setupMainButtons();
    },

    idleDetection = function() {
      var idleInterval = setInterval(timerIncrement, 1000);

      $(this).mousemove(function(e) {
        idleTime = 0;
      });
      $(this).keypress(function(e) {
        idleTime = 0;
      });
    },

    timerIncrement = function() {
      idleTime = idleTime + 1;

      if (idleTime > idleMax) {
        if (window.location.hash == "#attract" || window.location.href == startURL) {
          idleTime = 0;

        } else {
          idleTime = 0;
          window.location.href = startURL;
          //TO DO include the reset?
        }
      }
    }

    reset = function() {
      $("#modal").hide();
    }

  insertText = function() {
    $(".list-title").html(listTitle)
    $("footer").html(footerText)
  }


  var width = 200,
    height = 44 * 4 + 20,
    speed = 300,
    button,
    overlay,
    menu;

  function animate_menu(menu_toggle) {
    console.log("animate menu", menu_toggle)
    if (menu_toggle == 'open') {
      overlay.addClass('open');
      button.addClass('on');
      overlay.animate({
        opacity: 1
      }, speed);
      //menu.animate({width: width, height: height}, speed).fadeIn();
      menu.fadeIn();
    }

    if (menu_toggle == 'close') {
      button.removeClass('on');
      overlay.animate({
        opacity: 0
      }, speed);
      overlay.removeClass('open');
      //menu.animate({width: "0", height: 0}, speed).fadeOut();
      menu.fadeOut();
    }
  }
  setupHamburger = function() {

    button = $('#menuBtn');
    //buttonClose  = $('#menuBtnOpened');
    menuLink = $('.menu-link')
    overlay = $('#modal');
    menu = $('#menu');

    button.on('click', function(e) {
      console.log("menu button clicked")

      //TO DO check if popup open
      actions.closePopup();

      $("#callToAction").hide();
      if (overlay.hasClass('open')) {
        animate_menu('close');

      } else {
        animate_menu('open');
      }
    });

    // button.on('click', function(e){
    // 	if(button.hasClass('on')) {
    // 		animate_menu('close');
    // 	  } else {
    // 		animate_menu('open');
    // 	  }
    //   });
    // menuLink.on('click', function(e){
    // 	//if(overlay.hasClass('open')) {
    // 		console.log("menu link")
    // 	  animate_menu('close');
    // 	//}
    // });
    overlay.on('click', function(e) {
      console.log("modal click")
      if (overlay.hasClass('open')) {
        animate_menu('close');
      }
    });

    $('a[href="#"]').on('click', function(e) {
      e.preventDefault();
    });
  }
  setupMainButtons = function() {
    var $item = $("#video-list .menu-item").clone();
    var $subItem = $("#video-list .menu-item").clone();
    //var $subTitle = $("#video-list .menu-sublist").clone();
    //var $subItem = $("#video-list .menu-sublist").clone();
    document.getElementById("video-list").innerHTML = "";

    var dataArray = dm.pageArray.videos.videoslist;
    for (var i = 0; i < dataArray.length; i++) {
      if (dataArray[i].sublist !== undefined) {
        //$subTitle.find('.menu-sublist .list-title').html(dataArray[i].title);

        $("#video-list").append("<ul>");
        var subDataArray = dataArray[i].sublist;
        for (var j = 0; j < subDataArray.length; j++) {
          //console.log(subDataArray[j]);
          $subItem.addClass('sublist-item')
          $subItem.find('.video-title').html(subDataArray[j].title);
          $subItem.find('a').attr("data-link", subDataArray[j].link)
          $("#video-list").append($subItem.clone());
        }
        //$("#video-list").append($subTitle.clone());
        $("#video-list").append("</ul>");
      } else {
        console.log("item")
        $item.find('.video-title').html(dataArray[i].title);
        $item.find('a').attr("data-link", dataArray[i].link)
      }

      $("#video-list").append($item.clone());
    }


    var videoSrc;

    $('#video-list a').off("click").on("click", function(event) {
      actions.showPopup("template-videoPopup", {
        top: "96px"
      });
      console.log('open video page');

      videoSrc = $(this).attr("data-link");

      animate_menu('close');

      initialiseMediaPlayer();
      videoLoad();
      videoControls();
    });

    videoLoad = function() {
      var vPath = videoAssetPath + '/' + videoSrc
      console.log(videoAssetPath + '/' + videoSrc, vPath);
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

      mediaPlayer.addEventListener('durationchange', function() {
        //console.log('Duration change', mediaPlayer.duration);
        mediaPlayer.addEventListener('timeupdate', updateProgressBar, false);
      });
    }

    togglePlayPause = function() {
      if (mediaPlayer.paused || mediaPlayer.ended) {
        btn.className = 'pause';
        mediaPlayer.play();
      } else {
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
      if (mediaPlayer.duration) {
        var percentage = Math.floor((100 / mediaPlayer.duration) *
        mediaPlayer.currentTime);
        //console.log(mediaPlayer.duration, percentage)
        progressBar.value = percentage;
        progressBar.innerHTML = percentage + '% played';
      }
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
    launch: launch
  };
}();
var app = new Application();
var videoPage = new VideoPage();

var dc = new DataController();
var dm = new DataModel();
var actions = new Actions();
var content = new Content();
var utils = new Utils();
