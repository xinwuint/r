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
            rssInterval: 3600*1000,  // 1h
            rssStoryLen: 120,   // 120 characters
            videoRootUrl: 'assets/video/',
            videoManifestFile: 'videos_{locale}.json',
            emailFrom: 'no-reply@ryder-digit.com',
            videoSiteAbsUrl: 'http://ryder-digit.com/videos/',
        };

    // state
    var _config,
        _langCode = '',
        _countryCode = '',
        _sportsNewsCat = 0; // indicate next cat (rss1 or rss2)

    function init(config) {
        // deal with config
        _config = $.extend(true, {}, _confDefault, config);
        var tmp = _config.locale.split('-');
        _langCode = tmp[0] || '' ;
        _countryCode = tmp[1] || '';
    }

    //=========================== infra start ==============================

    function infra_fetch2RssStories(url) {
        return Pn.ajax.get(url).then(function(data) {
            // this is a filter, not just callback
            if(data && data.channel && data.channel.item && data.channel.item.length) {
                return [
                    data.channel.item[0].description,
                    data.channel.item[1] ? data.channel.item[1].description : ''
                ];
            }
            return ['', ''];
        });
    }

    function infra_email(addr) {
        var videoSiteUrl = _config.videoSiteAbsUrl;
        var from = _config.emailFrom;
        var body = Pn.l10n.get('email.body').replace('{url}', videoSiteUrl);

        var d = $.Deferred();
        // fack code for success
        d.resolve();
        // fack code for failure
        //d.reject();
        return d;
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

    function infra_initKeyboard(langCode) {
        var frLayout = {
            'normal': [
                'q w e r t y u i o p {bksp}',
                'a s d f g h j k l {accept}',
                '{meta2} z x c v b n m @ .',
                '{meta1} {space} {meta1}'
            ],
            'meta2': [
                'à â ä ç é è ê ë ï î {bksp}',
                'ì í ò ó ô ö œ ù ú {accept}',
                '{normal} û ü µ ¨ £ € ¥ @ .',
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
                'meta2'  : 'ÀÉÖ'
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
        kb.reveal();
    }

    // in json, videoFile has no path. So add it.
    function _adjustUrl(data, rootUrl) {
        if(data) {
            for(var cat in data) {
                var l = data[cat];
                if(l && l.length) {
                    for(var i=0; i<l.length; i++) {
                        var v = l[i];
                        if(v) {
                            if(v.thumbnailFile) v.thumbnailFile = rootUrl + v.thumbnailFile;
                            if(v.videoFile) v.videoFile = rootUrl + v.videoFile;
                            if(v.videoSecondaryFile) v.videoSecondaryFile = rootUrl + v.videoSecondaryFile;
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
            data.__proto__ = undefined;
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

    //=========================== infra end ==============================

    function biz_displayDateTime() {
        var dateObj = new Date();
        // https://stackoverflow.com/questions/8888491/how-do-you-display-javascript-datetime-in-12-hour-am-pm-format
        $('header .aTime').text(dateObj.toLocaleTimeString(_langCode, _timeFormat));    // fr and fr-CA have different output
        // https://stackoverflow.com/questions/3552461/how-to-format-a-javascript-date
        $('header .aDate').text(dateObj.toLocaleDateString(_langCode, _dateFormat));
    }

    function biz_displayRss() {
        var rssUrls = _config.rssUrls[_config.locale];
        var set1;

        // story 1
        var pRss1 = infra_fetch2RssStories(rssUrls[0]).done(function(data){
            set1 = data;
            $('footer .aContent1').text(Pn.util.ellipsis(data[0], _config.rssStoryLen));
        });

        // story 2
        if(!rssUrls[1] && !rssUrls[2]) {
            // display top news
            $.when(pRss1).done(function(){
                $('footer .aContent2').text(Pn.util.ellipsis(set1[1], _config.rssStoryLen));
            });
        } else {
            var url;
            if(rssUrls[2]) {
                // pick url between 2
                url = _sportsNewsCat === 0 ? rssUrls[1] : rssUrls[2];
                _sportsNewsCat = _sportsNewsCat++ % 2;
            } else {
                url = rssUrls[1];
            }
            infra_fetch2RssStories(url).done(function(data){
                $('footer .aContent2').text(Pn.util.ellipsis(data[0], _config.rssStoryLen));
            });
        }
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

    function biz_showKeyboard() {
        // put transition here
        $('main section.aLayerSec').show();
        $('main section.aKeyboardSec').show();
    }

    function biz_hideKeyboard() {
        // put transition here
        $('main section.aLayerSec').hide();
        $('main section.aKeyboardSec').hide();
        infra_clearEmailInput();
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
                    // TODO $(this).find('video').on('ended', function(){alert('video ended!')});
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
            biz_showKeyboard();
        });

        // back to video btn
        $('main .aKeyboardSec .aBackBtn').on('click', function(){
            biz_hideKeyboard();
        });

        // on email input ok
        $('main .aKeyboardSec .aEmailField').on('accepted', function(e, keyboard, el) {
            var addr = el.value;
            infra_email(addr).done(function(){
                biz_hideKeyboard();
            });
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

        // init keyboard
        infra_initKeyboard(_langCode);

        // events
        _hookEventHandlers();

        // display datetime
        biz_displayDateTime();
        window.setInterval(biz_displayDateTime, 10*1000);    // every 10 sec

        // display rss
        biz_displayRss();
        window.setInterval(biz_displayRss, _config.rssInterval);
        

        // play attract loop
        biz_showAtrractLoop();

        // load video list
        infra_loadVideoListAsync();
    }

    var app = {
        init:               init,
        start:              start,
        infra_fetch2RssStories: infra_fetch2RssStories
    };


    // publish ==================================
    window.app = app;

}(Pn, jQuery, this));
