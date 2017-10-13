/*  ryder.app.js
    JS library for Ryder app, ver 0.9
    This lib implements the basic functionality of Ryder app, used by ryder.launch.js

    Created by Xin Wu, 2017-09-25

    Dependency:
        jQuery 1.8+
        pn.core.js
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
        _optDefault = {
            locale: "en-us",    // default locale
            idleTimeout: 2*60,  // 2 min
        };

    // state
    var _state,
        _langCode = '',
        _countryCode = '';

    function init(options) {
        // deal with options
        _state = $.extend(true, {}, _optDefault, options);
        var tmp = _state.locale.split('-');
        _langCode = tmp[0] || '' ;
        _countryCode = tmp[1] || '';
    }

    function start() {
        Pn.l10n.locale(_state.locale);

        // hook event handler
        $('main .aAttractLoopSec .aStart').on('click', showVideoList);

        showAtrractLoop();
    }

    function stop() {
        // unhook event handler
        $('main .aAttractLoopSec .aStart').off('click', showVideoList);
    }

    function displayDateTime(dateObj) {
        // https://stackoverflow.com/questions/8888491/how-do-you-display-javascript-datetime-in-12-hour-am-pm-format
        $('header .aTime').text(dateObj.toLocaleTimeString(_langCode, _timeFormat));    // fr and fr-CA have different output
        // https://stackoverflow.com/questions/3552461/how-to-format-a-javascript-date
        $('header .aDate').text(dateObj.toLocaleDateString(_langCode, _dateFormat));
    }

    function showAtrractLoop() {
        // put transition here
        $('main section').hide();
        $('main section.aAttractLoopSec video').each(function(){
            var $this = $(this);
            $this.attr('src', $this.attr('data-src'));
        });
        $('main section.aAttractLoopSec').show();
    }

    function showVideoList() {
        // put transition here
        $('main section').hide();
        $('main section.aAttractLoopSec video').attr('src', '');
        $('main section.aVideoListSec').show();
    }

    function displayRss() {
        
    }

    var app = {
        init:               init,
        start:              start,
        displayDateTime:    displayDateTime,
        showAtrractLoop:    showAtrractLoop,
        showVideoList:      showVideoList
    };


    // publish ==================================
    window.app = app;

}(Pn, jQuery, this));
