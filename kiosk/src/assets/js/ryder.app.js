/*  ryder.app.js
    JS library for Ryder app, ver 0.9
    This lib implements the basic functionality of Ryder app, used by ryder.launch.js

    Created by Xin Wu, 2017-09-25

    Dependency:
        jQuery 1.8+
        handlebars.js
        jquery.keyboard.js
        jquery.bpopup-0.9.4.min.js
        l10n.min.js
        pn.core.js
        pn.ui.js
        pn.idle.js
        pn.l10n.js
        ryder.et.js // tracking
*/

/*
    CONVENTION
        _func :         private/util/helper function, which is used by infra/biz;
        infra_func:     atomic functionality for ryder app;
        biz_func:       facade functionality, which is triggered by user or timer, and may have transition effect;
*/

;(function (Pn, $, window, undefined) {
    "use strict";

    // const =====================================================================================
    var _dateFormat = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
        //_timeFormat = { hour: 'numeric', minute: 'numeric', hour12: true }, //not compatible with old browser
        _confDefault = {
            locationId: 'test-location',        // default locationid
            locale: 'en-us',                    // default locale
            idleTimeout: 2*60,                  // 2 min
            rssUpdateInterval: 3600,            // 1h
            rssDisplayInterval: 20,             // 20 sec
            rssStoryLen: 120,                   // 120 characters
            videoRootUrl: 'assets/video/',
            videoManifestFile: 'videos_{locale}.txt',
            emailApiUrl: '',
            emailApiAuthCode: '',
            videoSiteAbsUrl: 'http://ryder-digital.com/videosite/?locale={locale}&location={location}',
        };

    // state
    var _config,
        _langCode = '',
        _countryCode = '';

    // rss related
    var _rssStories = Pn.util.createArray([2, 5], ''),       // 2x5: 2 rows (top and sports). each row has 5 stories.
        _rssLoopIdx1 = -1,        // which story is shown?
        _rssLoopIdx2 = -1,        // which story is shown?
        _rssLoopLen = 5,
        _rssWaitLoad = $.Deferred();    // indicate if rss is loaded

    function init(config) {
        // deal with config
        _config = $.extend(true, {}, _confDefault, config);
        var tmp = _config.locale.split('-');
        _langCode = tmp[0] || '' ;
        _countryCode = tmp[1] || '';
    }

    //=========================== infra start ==============================

    function infra_fetchRssStories(url, max, textLen) {
        var d = $.Deferred();
        Pn.ajax.ajax({
            url: url,
            cache: false
        })
        .done(function(data) {
            var rst = [];
            if(data && data.channel && data.channel.item && data.channel.item.length) {
                for(var i = 0, j = 0, len = data.channel.item.length; i < len && j < max; i++) {
                    if(data.channel.item[i].description) {
                        rst[j++] = Pn.util.ellipsis(data.channel.item[i].description, textLen);
                    }
                }
            }
            d.resolve(rst);
        })
        .fail(function(){
            d.resolve([]);
        });
        return d.promise();
    }

    function infra_email(addr) {
        var videoSiteUrl = _config.videoSiteAbsUrl.replace('{locale}', _config.locale).replace('{location}', _config.locationId);
        var title = Pn.l10n.get('email.title');
        var body = Pn.l10n.get('email.body').replace('{url}', videoSiteUrl);

        return Pn.ajax.ajax({
            url: _config.emailApiUrl,
            method: 'POST',
            data: {
                AuthCode: _config.emailApiAuthCode,
                Recipients: addr,
                Subject: title,
                Message: body
            }
        });
    }

    function infra_playAtrractLoopVideo() {
        $('main section.aAttractLoopSec video').each(function(){
            var $this = $(this);
            $this.attr('src', $this.attr('data-src'));
        });
    }

    function infra_stopAtrractLoopVideo() {
        $('main section.aAttractLoopSec video').attr('src', '');
    }

    function infra_showErrMsgOnKeyboard() {
        $('main .aKeyboardSec .aCoverWrap').show();
        $('main .aKeyboardSec .aErrWrap').show();
    }

    function infra_hideErrMsgOnKeyboard() {
        $('main .aKeyboardSec .aCoverWrap').hide();
        $('main .aKeyboardSec .aErrWrap').hide();
    }

    function infra_showErrMsgOnFooter() {
        $('footer .aRss').hide();
        $('footer .aErr').show();
    }

    function infra_hideErrMsgOnFooter() {
        $('footer .aRss').show();
        $('footer .aErr').hide();
    }

    function infra_showPointer() {
        $('main .aVideoListSec .aPointerBtn').show();
    }

    function infra_hidePointer() {
        $('main .aVideoListSec .aPointerBtn').fadeOut();
    }

    function infra_clearVideoTileSelection() {
        Pn.ui.toggleSelected('main .aVideoListSec .aVideoTile', false);
    }

    function infra_initKeyboard(langCode) {
        var frLayout = {
            'normal': [
                'q w e r t y u i o p {bksp}',
                'a s d f g h j k l {accept}',
                '{meta2} z x c v b n m @ .',
                '{meta1} {space} {meta1}'
            ],
            'meta2': [
                'Ã  Ã¢ Ã¤ Ã§ Ã© Ã¨ Ãª Ã« Ã¯ Ã® {bksp}',
                'Ã¬ Ã­ Ã² Ã³ Ã´ Ã¶ Å“ Ã¹ Ãº {accept}',
                '{normal} Ã» Ã¼ Âµ Â¨ Â£ â‚¬ Â¥ @ .',
                '{meta1} {space} {meta1}'
            ],
            'meta1': [
                '1 2 3 4 5 6 7 8 9 0 {bksp}',
                '! # $ % ^ & * ( ) {accept}',
                ': ; " \' , ? / + - _',
                '{normal} {space} {normal}'
            ]
        };
        var enLayout = {
            'normal': [
                'q w e r t y u i o p {bksp}',
                'a s d f g h j k l {accept}',
                '~ z x c v b n m @ .',
                '{meta1} {space} {meta1}'
            ],
            'meta1': [
                '1 2 3 4 5 6 7 8 9 0 {bksp}',
                '! # $ % ^ & * ( ) {accept}',
                ': ; " \' , ? / + - _',
                '{normal} {space} {normal}'
            ]
        };

        $('.aEmailField').keyboard({
            display: {
                'bksp'   : 'del',
                'accept'  : 'send:Email address',
                'normal' : 'ABC',
                'meta1'  : '.?123',
                'meta2'  : 'Ã€Ã‰Ã–'
            },

            usePreview: false,
            alwaysOpen: true,
            restrictInput: true,
            acceptValid: true,  // if invalid input, accept btn is disabled
            keyBinding: 'mousedown touchstart',
            appendLocally: true,
            layout: 'custom',
            customLayout: langCode === 'fr' ? frLayout : enLayout,

            validate : function(keyboard, value, isClosing) {
                return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value);
            }

        });
    }

    function infra_clearEmailInput() {
        var kb = $('.aEmailField').getkeyboard();
        kb.$preview.val('');
        kb.reveal();  //caused keyboard to move around, solved with important! css values
    }

    // in json, videoFile has no path. So add it.
    function _adjustUrl(data, rootUrl) {
        if(data) {
            for(var cat in data) {
                if(!data.hasOwnProperty(cat)) continue;
                var l = data[cat];
                if(l && l.length) {
                    for(var i=0; i<l.length; i++) {
                        var v = l[i];
                        if(v) {
                            if(v.thumbnailFile) v.thumbnailFile = rootUrl + v.thumbnailFile;
                            if(v.videoFile) v.videoFile = rootUrl + v.videoFile;
                            if(v.videoFile2) v.videoFile2 = rootUrl + v.videoFile2;
                        }
                    }
                }
            }
        }
    }

    function infra_loadVideoListAsync() {
        var jsonfile = _config.videoRootUrl + _config.videoManifestFile.replace('{locale}', _config.locale);
        $.getJSON(jsonfile).done(function(data){
            // check
            var okSafety = data.safety && data.safety.length > 0;
            var okWhyryder = data.whyryder && data.whyryder.length > 0;
            if(!okSafety && !okWhyryder) return;

            // adjust url
            _adjustUrl(data, _config.videoRootUrl);

            // template
            var template = Handlebars.compile($('#template-videolist').html());

            // mount html
            if(okSafety) $('.aGridSafety').html(template(data.safety));
            else $('.aGridSafety').empty();
            if(okWhyryder) $('.aGridWhyryder').html(template(data.whyryder));
            else $('.aGridWhyryder').empty();
        });
    }

    //VIDEOS
    var mediaPlayer;
    var progressBar;
    var btn;

    function initialiseMediaPlayer() {
      mediaPlayer = document.getElementById('video');
      progressBar = document.getElementById('progress-bar');
      btn = document.getElementById('play-pause-button');
      mediaPlayer.controls = false;
      videoControls();
    }

    function videoControls() {
      $('#play-pause-button').off("click").on("click", function(event) {
        togglePlayPause();
      });
      $('#volume-inc-button').off("click").on("click", function(event) {
        changeVolume("+")
      });
      $('#volume-dec-button').off("click").on("click", function(event) {
        changeVolume("-")
      });
      $('#volume-mute-button').off("click").on("click", function(event) {
        muteVolume()
      });
      mediaPlayer.addEventListener('durationchange', function() {
        mediaPlayer.addEventListener('timeupdate', updateProgressBar, false);
      });
    }

    function togglePlayPause() {
      if (mediaPlayer.paused || mediaPlayer.ended) {
        btn.className = 'pause';
        mediaPlayer.play();
      } else {
        btn.className = 'play';
        mediaPlayer.pause();
      }
    }

    function changeButtonType(btn, value) {
      btn.title = value;
      btn.innerHTML = value;
      btn.className = value;
    }

    function updateProgressBar() {
      if (mediaPlayer.duration) {
        var percentage = Math.floor((100 / mediaPlayer.duration) *
        mediaPlayer.currentTime);
        progressBar.value = percentage;
        progressBar.innerHTML = percentage + '% played';
      }
    }

    function changeVolume(direction) {
      if (direction === '+') mediaPlayer.volume += mediaPlayer.volume == 1 ? 0 : 0.1;
      else mediaPlayer.volume -= (mediaPlayer.volume == 0 ? 0 : 0.1);
    }

    function muteVolume() {
      if ( mediaPlayer.muted === true ) mediaPlayer.muted = false;
      else mediaPlayer.muted = true;
    }

    function replayMedia() {
      resetPlayer();
      mediaPlayer.play();
    }

    function fullscreenMedia() {
      mediaPlayer.webkitRequestFullScreen();
    }

    function resetPlayer() {
      progressBar.value = 0;
      mediaPlayer.currentTime = 0;
      changeButtonType(playPauseBtn, 'play');
    }
    //=========================== infra end ==============================

    function _getTimeString(date) {
        var h = date.getHours(),
            m = date.getMinutes(),
            ap = h < 12 ? 'AM' : 'PM';
        if(h === 0) h = 12;
        else if(h > 12) h -= 12;

        return h + ':' + (m < 10 ? '0' : '') + m + ' ' + ap;
    }

    function biz_populateDateTime() {
        var date = new Date();

        //not compatible with old browser
        // https://stackoverflow.com/questions/8888491/how-do-you-display-javascript-datetime-in-12-hour-am-pm-format
        //$('header .aTime').text(date.toLocaleTimeString(_langCode, _timeFormat));    // fr and fr-CA have different output

        $('header .aTime').text(_getTimeString(date));

        // https://stackoverflow.com/questions/3552461/how-to-format-a-javascript-date
        // en: Saturday, November 11, 2017
        // fr: samedi 11 novembre 2017
        $('header .aDate').text(date.toLocaleDateString(_langCode, _dateFormat));
    }

    function biz_sendEmail(addr) {
        infra_email(addr)
            .done(biz_hideKeyboard)
            .fail(infra_showErrMsgOnKeyboard);
    }

    // make sure each set has at lease one line.
    function biz_updateStories() {
        var rssUrls = _config.rssUrls[_config.locale],
            max = _rssLoopLen * 2,
            textLen = _config.rssStoryLen;

        // rssUrls[0] gives [] even not applicable
        $.when(rssUrls[0] ? infra_fetchRssStories(rssUrls[0], max, textLen) : [],
            rssUrls[1] ? infra_fetchRssStories(rssUrls[1], max, textLen) : undefined,
            rssUrls[2] ? infra_fetchRssStories(rssUrls[2], max, textLen) : undefined)
        .done(function(data1, data2, data3) {
            var set1 = [],
                set2 = [];

            if(!data2 && !data3) {
                // bath set1 and set2 come from data1
                for(var i=0, j=0, len=data1.length; i < len && j < _rssLoopLen; j++) {
                    set1.push(data1[i++]);
                    if(i < len) set2.push(data1[i++]);
                }

                // adjust set1 and set2.
                // the most diff of size between set1 and set2 is 1
                if(set1.length === 0) { // 0,0
                    set1.push('');
                    set2.push('');
                } else if(set2.length === 0) {  // 1,0
                    set2.push('');
                } else if(set1.length === 1) {  // 1,1
                    set1.push(set2[0]);
                    set2.push(set1[0]);
                } else if(set2.length === 1) {  // 2,1
                    set2.push(set1[0]);
                }

            } else {
                // set1 comes from data1
                for(var i=0, j=0, len=data1.length; i < len && j < _rssLoopLen; j++) {
                    set1.push(data1[i++]);
                }

                // set2
                if(data2 && data3) {
                    // set2 comes from data2 and data3 evenly
                    for(var i2=0, i3=0, j=0, len2=data2.length, len3=data3.length; (i2 < len2 || i3 < len3) && j < _rssLoopLen;) {
                        if(i2 < len2 && j < _rssLoopLen) set2[j++] = data2[i2++];
                        if(i3 < len3 && j < _rssLoopLen) set2[j++] = data3[i3++];
                    }

                } else {
                    // set2 comes from either one
                    var data = data2 ? data2 : data3;
                    for(var i=0, j=0, len=data.length; i < len && j < _rssLoopLen; j++) {
                        set2.push(data[i++]);
                    }
                }

                // adjust set1 and set2
                if(set1.length === 0) set1.push('');
                if(set2.length === 0) set2.push('');
            }

            // end up
            _rssStories[0] = set1;
            _rssStories[1] = set2;

            // set signal. no harm to call it again and again.
            _rssWaitLoad.resolve();
        });
    }

    function biz_switchStory() {
        // wait until stories are loaded
        biz_hideStory();
        $.when(_rssWaitLoad).done(function(){
            //biz_hideStory();
            _rssLoopIdx1 = (_rssLoopIdx1 + 1) % _rssStories[0].length;
            _rssLoopIdx2 = (_rssLoopIdx2 + 1) % _rssStories[1].length;
            $('footer .aRss .aContent1Story').text(_rssStories[0][_rssLoopIdx1]);
            $('footer .aRss .aContent2Story').text(_rssStories[1][_rssLoopIdx2]);
            biz_showStory();
        });
    }

    function biz_hideStory() {
        $('footer .uContent1').fadeOut();
        $('footer .uContent2').fadeOut();
    }

    function biz_showStory() {
        $('footer .uContent1')
            .stop()
            .css('top', '100%')
            .css('opacity', '1')
            .show()
            .animate({
          top: "0"
        },  500, 'easeOutBounce')

        $('footer .uContent2')
            .stop()
            .css('top', '100%')
            .css('opacity', '1')
            .show()
            .delay(100)
            .animate({
          top: "0"
        },  500, 'easeOutBounce');
    }

    function biz_showAtrractLoop() {
        $('main section').hide();
        infra_playAtrractLoopVideo();
        $('main section.aAttractLoopSec').show();
        $('.uWelcome').css("width","422px");
        $('.uStart, .uWelcome div').fadeIn();
    }

    function biz_showVideoList() {
        infra_stopAtrractLoopVideo();
        infra_clearVideoTileSelection();
        biz_toggleAudio(false); // set to default lang
        anim_videoList();
    }

    function anim_attractLoopOut() {
        $('.uStart, .uWelcome div').stop().fadeOut(250);
        $('.uWelcome').stop().animate({
            width: "100%"
        }, 350, "easeOutExpo", function() {
            $('main section').hide();
            biz_showVideoList();
            infra_showPointer();
        });
    }

    function anim_videoList() {
        $('.uVideoListDiv').css("margin-top", "700px").animate({
            marginTop: 0
        },  250, "easeInCirc");

        $('main section.aVideoListSec').fadeIn();
    }

    function biz_showKeyboard() {
        $('main section.aLayerSec').fadeIn();
        $('main section.aKeyboardSec').show().animate({
          right: "0"
        }, 250, "easeOutCirc");
    }

    function biz_hideKeyboard() {
        $('main section.aKeyboardSec').stop().animate({
          right: "-1140px"
        }, 250, "easeOutExpo" ).hide();

        $('main section.aLayerSec').fadeOut(500);
        infra_clearEmailInput();
        infra_hideErrMsgOnKeyboard();
    }

    // video popup
    function biz_playVideo(url) {
        Pn.ui.popupModal('.aVideoPopup', {
            blockUi: true,
            overlayClose: true,
            onLaunching: function(){
                $(this).find('video').attr('src', url);
                return true;
            },
            onLaunched: function(){
                initialiseMediaPlayer();
                var v = $(this).find('video');
                v.on('ended', function(){
                    // close popup when done
                    Pn.ui.fireReturnEvent(v);
                });
                Pn.idle.pause();
                try {
                    v[0].play();
                } catch(err) {}
                return true;
            }
        }).done(function(){
            var v = $(this).find('video');
            v[0].pause();
            v.attr('src', '');
            v.off('ended');
            Pn.idle.resume();
        });
    }

    function biz_checkConnectivity() {
        Pn.util.checkConnectivity().done(function(online){
            if(online) infra_hideErrMsgOnFooter();
            else infra_showErrMsgOnFooter();
        });
    }

    function biz_toggleAudio(isSelected) {
        Pn.ui.toggleSelected('main .aVideoListSec .aToggleBtn', isSelected);
        $('main .aVideoListSec').toggleClass('uAudioToggled', isSelected);
        // set video title
        $('main .aVideoListSec .aVideoTile').each(function(i, v){
            var $this = $(this);
            var has2ndLang = !!$this.attr('data-video-src-2');
            if(has2ndLang) {
                $this.attr('data-lang-idx', isSelected ? '1' : '0');
                var title = $this.attr(isSelected ? 'data-title-2' : 'data-title');
                $this.find('.aTitle').text(title);
            }
        });
    }

    function biz_startOver() {
        biz_hideKeyboard();
        biz_showAtrractLoop();
        et.endSession();
    }

    function _getFilename(url) {
        var idx = url.lastIndexOf('/');
        return idx < 0 ? url : url.substring(idx + 1, url.length);
    }

    var $scrollContainer = $('.uVideoListDiv');
    var scrollContainerStartPos;
    var dragStartPos;

    function _hookEventHandlers() {
        $scrollContainer.on('mousedown', onTouchScrollPress);

        // start btn
        $('main .aAttractLoopSec .aStart').on('click', function(){
            et.startSession();
            anim_attractLoopOut();
        });

        // audio toggle btn
        $('main .aVideoListSec .aToggleBtn').on('click', function(){
            var isSelected = Pn.ui.toggleSelected(this);
            biz_toggleAudio(isSelected);
        });

        // email btn
        $('main .aVideoListSec .aEmailBtn').on('mousedown', function(){
            Pn.ui.toggleSelected(this, true);
        }).on('mouseup', function(){
            Pn.ui.toggleSelected(this, false);
        }).on('click', biz_showKeyboard);

        // back to video btn
        $('main .aKeyboardSec .aBackBtn').on('click', biz_hideKeyboard);

        // on email input ok
        $('main .aKeyboardSec .aEmailField').on('accepted', function(e, keyboard, el) {
            var addr = el.value;
            biz_sendEmail(addr);
        });

        // video tile
        $('main .aVideoListSec').on('click', '.aVideoTile', function(){
            $('main .aVideoListSec .aPointerBtn').stop().fadeOut();
            var $this = $(this);

            // select this tile
            infra_clearVideoTileSelection();
            Pn.ui.toggleSelected($this, true);

            // hide pointer
            infra_hidePointer();

            // popup
            var is1stLang = $this.attr('data-lang-idx') === '0';
            var videoUrl = $this.attr(is1stLang ? 'data-video-src' : 'data-video-src-2');
            biz_playVideo(videoUrl);

            // tracking
            et.playVideo(_getFilename(videoUrl), is1stLang);
        });
    }

    function onTouchScrollPress(e) {
        console.log("onTouchScrollPress()");

        scrollContainerStartPos = $scrollContainer.scrollTop();
        dragStartPos = e.pageY

        $(document).on('mouseup', onTouchScrollRelease);
        $(document).on('mousemove', onTouchScrollMove);
    }

    function onTouchScrollRelease(e) {
        console.log("onTouchScrollRelease()");
        $(document).off('mouseup', onTouchScrollRelease);
        $(document).off('mousemove', onTouchScrollMove);
    }

    function onTouchScrollMove(e) {
        console.log("onTouchScrollMove()", e.pageY);
        $scrollContainer.scrollTop(scrollContainerStartPos + dragStartPos - e.pageY);
    }


    function start() {
        // localize
        Pn.l10n.locale(_config.locale);

        // check connectivity
        biz_checkConnectivity();
        window.setInterval(biz_checkConnectivity, 30*1000);     // 30 sec

        // update rss story
        biz_updateStories();
        window.setInterval(biz_updateStories, _config.rssUpdateInterval*1000);

        // populate datetime
        biz_populateDateTime();
        window.setInterval(biz_populateDateTime, 10*1000);    // every 10 sec

        // init keyboard
        infra_initKeyboard(_langCode);
        biz_hideKeyboard(); // this will position it properly

        // events
        _hookEventHandlers();

        // load video list
        infra_loadVideoListAsync();

        // idle timer
        Pn.idle.start(_config.idleTimeout, biz_startOver);

        // display rss story
        biz_switchStory();
        window.setInterval(biz_switchStory, _config.rssDisplayInterval*1000);

        biz_startOver();
    }

    var app = {
        init:               init,
        start:              start
    };


    // publish ==================================
    window.app = app;

}(Pn, jQuery, this));   // et = eventtracking
