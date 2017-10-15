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

;(function (lib, $, window, undefined) {
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
        _countryCode = '',
        _template;

    function init(config) {
        // deal with options
        _config = $.extend(true, {}, _confDefault, config);
        var tmp = _config.locale.split('-');
        _langCode = tmp[0] || '' ;
        _countryCode = tmp[1] || '';
    }

    function infra_displayDateTime(dateObj) {
        // https://stackoverflow.com/questions/8888491/how-do-you-display-javascript-datetime-in-12-hour-am-pm-format
        $('header .aTime').text(dateObj.toLocaleTimeString(_langCode, _timeFormat));    // fr and fr-CA have different output
        // https://stackoverflow.com/questions/3552461/how-to-format-a-javascript-date
        $('header .aDate').text(dateObj.toLocaleDateString(_langCode, _dateFormat));
    }

    function infra_displayRss() {
        
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
        // correct video/image url based on root url.
    }

    function biz_loadVideosAsync() {
        var jsonfile = _config.videoRootUrl + '/' + _config.videoListFile.replace('{locale}', _config.locale);
        $.getJSON(jsonfile).done(function(data){
            // adjust url
            _adjustUrl(data);

            // mount html
            if(data.safety && data.safety.length > 0) $('.aGridSafety').html(_template(data.safety));
            else $('.aGridSafety').empty();
            if(data.whyryder && data.whyryder.length > 0) $('.aGridWhyryder').html(_template(data.whyryder));
            else $('.aGridWhyryder').empty();
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
        });

        // click on video
        $('main .aVideoListSec').on('click', '.aVideoTile', function(){
            var $this = $(this);
            var needSecond = $this.find('.aBalloon').css('visibility') !== 'hidden';
            var videoUrl = $this.attr(needSecond ? 'data-video-2nd-src' : 'data-video-src');
            alert('video Url = ' + videoUrl);
        });
    }

    function _unhookEventHandlers() {
        // start btn
        $('main .aAttractLoopSec .aStart').off('click');

        // toggle audio btn
        $('main .aVideoListSec .aToggleBtn').off('click');

        // email btn
        $('main .aVideoListSec .aEmailBtn').off('mousedown mouseup');
    }

    function start() {
        // localize
        Pn.l10n.locale(_config.locale);

        // template
        _template = Handlebars.compile($('#template-videolist').html());

        // load video
        biz_loadVideosAsync();

        _hookEventHandlers();

        //showAtrractLoop();
        biz_showVideoList();
    }

    function stop() {
        _unhookEventHandlers();
    }

    var app = {
        init:               init,
        start:              start,
        loadVideos:     biz_loadVideosAsync,
    };


    // publish ==================================
    window.app = app;

}(Pn, jQuery, this));
