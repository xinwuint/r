/*  ryder.app.js
    JS library for Ryder app, ver 0.9
    This lib implements the basic functionality of Ryder app, used by ryder.launch.js

    Created by Xin Wu, 2017-09-25

    Dependency:
        jQuery 1.8+
        handlebars.js
        pn.core.js
        pn.ui.js
        pn.idle.js
        pn.l10n.js
*/

/*
    app
        void    init();
*/

;(function (Pn, $, window, undefined) {
    "use strict";

    // const =====================================================================================
    var _dateFormat = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
        _timeFormat = { hour: 'numeric', minute:'numeric', hour12: true },
        _confDefault = {
            locale: 'en-us',    // default locale
            idleTimeout: 2*60,  // 2 min
            rssStoryLen: 120,   // 120 characters
            videoRootUrl: 'assets/video',
            videoListFile: 'videos_{locale}.json'
        };

    // state
    var _config,
        _langCode = '',
        _countryCode = '';

    function init(config) {
        // deal with config
        _config = $.extend(true, {}, _confDefault, config);
        var tmp = _config.locale.split('-');
        _langCode = tmp[0] || '' ;
        _countryCode = tmp[1] || '';
    }

    function infra_displayDateTime() {
        var dateObj = new Date();
        // https://stackoverflow.com/questions/8888491/how-do-you-display-javascript-datetime-in-12-hour-am-pm-format
        $('header .aTime').text(dateObj.toLocaleTimeString(_langCode, _timeFormat));    // fr and fr-CA have different output
        // https://stackoverflow.com/questions/3552461/how-to-format-a-javascript-date
        $('header .aDate').text(dateObj.toLocaleDateString(_langCode, _dateFormat));
    }

    function infra_displayRss() {
        // TODO
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

    function biz_showAtrractLoop() {
        // put transition here
        $('main section').hide();
        infra_playAtrractLoopVideo();
        $('main section.aAttractLoopSec').show();
    }

    function biz_showVideoList() {
        // put transition here
        $('main section').hide();
        infra_stopAtrractLoopVideo();
        $('main section.aVideoListSec').show();
    }

    function _adjustUrl(data) {
        // TODO: correct video/image url based on root url.
    }

    function biz_loadVideoListAsync() {
        var jsonfile = _config.videoRootUrl + '/' + _config.videoListFile.replace('{locale}', _config.locale);
        $.getJSON(jsonfile).done(function(data){
            // check
            var okSafety = data.safety && data.safety.length > 0;
            var okWhyryder = data.whyryder && data.whyryder.length > 0;
            if(!okSafety && !okWhyryder) return;

            // adjust url
            _adjustUrl(data);

            // template
            var template = Handlebars.compile($('#template-videolist').html());

            // mount html
            if(okSafety) $('.aGridSafety').html(template(data.safety));
            else $('.aGridSafety').empty();
            if(okWhyryder) $('.aGridWhyryder').html(template(data.whyryder));
            else $('.aGridWhyryder').empty();
        });
    }

    function biz_playVideo(url) {
        Pn.ui.popupModal('.aVideoPopup', {
            blockUi: true,
            overlayClose: true,
            onLaunching: function(){
                $(this).find('video').attr('src', url);
                return true;
            },
            onLaunched: function(){
                try {
                    $(this).find('video')[0].play();
                } catch(err) {}
                return true;
            }
        }).done(function(){
            var v = $('.aVideoPopup').find('video');
            v[0].pause();
            v.attr('src', '');
        });
    }

    function _hookEventHandlers() {
        // start btn
        $('main .aAttractLoopSec .aStart').on('click', biz_showVideoList);

        // toggle audio btn
        $('main .aVideoListSec .aToggleBtn').on('click', function(){
            var isSelected = Pn.ui.toggleSelected(this);
            $('main .uVideoListSec').toggleClass('uAudioToggled', isSelected);
        });

        // email btn
        $('main .aVideoListSec .aEmailBtn').on('mousedown', function(){
            Pn.ui.selected(this, true);
        }).on('mouseup', function(){
            Pn.ui.selected(this, false);
        }).on('click', function(){
            alert('launch keyboard');
        });

        // click on video
        $('main .aVideoListSec').on('click', '.aVideoTile', function(){
            var $this = $(this);
            var needSecond = $this.find('.aBalloon').css('visibility') !== 'hidden';
            var videoUrl = $this.attr(needSecond ? 'data-video-2nd-src' : 'data-video-src');
            biz_playVideo(videoUrl);
        });
    }

    function _unhookEventHandlers() {
        // start btn
        $('main .aAttractLoopSec .aStart').off('click');

        // toggle audio btn
        $('main .aVideoListSec .aToggleBtn').off('click');

        // email btn
        $('main .aVideoListSec .aEmailBtn').off('mousedown mouseup');

        // TODO
    }

    function start() {
        // localize
        Pn.l10n.locale(_config.locale);

        // display datetime
        infra_displayDateTime();
        window.setInterval(infra_displayDateTime, 10*1000);    // every 10 sec

        _hookEventHandlers();

        // load video list
        biz_loadVideoListAsync();

        //showAtrractLoop();
        biz_showVideoList();
    }

    var app = {
        init:               init,
        start:              start
    };


    // publish ==================================
    window.app = app;

}(Pn, jQuery, this));
