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
        _timeFormat = { hour: 'numeric', minute:'numeric', hour12: true },
        _confDefault = {
            locale: 'en-us',    // default locale
            idleTimeout: 2*60,  // 2 min
            rssUpdateInterval: 3600,  // 1h
            rssDisplayInterval: 20,     // 20 sec
            rssStoryLen: 120,   // 120 characters
            videoRootUrl: 'assets/video/',
            videoManifestFile: 'videos_{locale}.ajax',
            emailFrom: 'do-not-reply@ryder-digital.com',
            videoSiteAbsUrl: 'http://ryder-digital.com/videos/',
        };

    // state
    var _config,
        _langCode = '',
        _countryCode = '',
        _sessionId;

    // rss related
    var _rssStories = Pn.util.createArray([2, 5], ''),       // 2x5: 2 rows (top and sports). each row has 5 stories.
        _rssLoopIdx = -1,        // which story is shown?
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

    // return 10 stories
    function infra_fetchRssStories(url) {
        return Pn.ajax.get(url).then(function(data) {
            // this is a filter, not just callback. Need use '.then()'
            if(data && data.channel && data.channel.item && data.channel.item.length) {
                var rst = [];
                for(var i=0; i<_rssLoopLen*2; i++) {
                    var s = data.channel.item[i] && data.channel.item[i].description ? data.channel.item[i].description : '';
                    rst.push(Pn.util.ellipsis(s, _config.rssStoryLen));
                }
                return rst;
            }
            return Pn.util.createArray([_rssLoopLen*2], '');
        });
    }

    function infra_email(addr) {
        var videoSiteUrl = _config.videoSiteAbsUrl + '?locale=' + _config.locale;
        var from = _config.emailFrom;
        var body = Pn.l10n.get('email.body').replace('{url}', videoSiteUrl);

        var d = $.Deferred();
        // fack code for success
        //d.resolve();
        // fack code for failure
        d.reject();
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
        $('main .aVideoListSec .aPointerBtn').hide();
    }

    function infra_clearVideoTileSelection() {
        Pn.ui.selected('main .aVideoListSec .aVideoTile', false);
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

    function biz_populateDateTime() {
        var dateObj = new Date();
        // https://stackoverflow.com/questions/8888491/how-do-you-display-javascript-datetime-in-12-hour-am-pm-format
        $('header .aTime').text(dateObj.toLocaleTimeString(_langCode, _timeFormat));    // fr and fr-CA have different output
        // https://stackoverflow.com/questions/3552461/how-to-format-a-javascript-date
        $('header .aDate').text(dateObj.toLocaleDateString(_langCode, _dateFormat));
    }

    function biz_sendEmail(addr) {
        infra_email(addr)
            .done(biz_hideKeyboard)
            .fail(infra_showErrMsgOnKeyboard);
    }

    function biz_updateStories() {
        var rssUrls = _config.rssUrls[_config.locale];
        var set1;

        // wait for ajax calls
        var waitCall1 = $.Deferred(),
            waitCall2 = $.Deferred(),
            waitCall3 = $.Deferred();

        // stories on left
        var pRss1 = infra_fetchRssStories(rssUrls[0]).done(function(data){
            set1 = data;
            Pn.util.copyArray(set1, 0, _rssStories[0], 0, _rssLoopLen);
        }).always(function(){
            waitCall1.resolve();
        });

        // stories on right
        if(!rssUrls[1] && !rssUrls[2]) {
            // take from set1
            $.when(pRss1).done(function(){
                Pn.util.copyArray(set1, 5, _rssStories[1], 0, _rssLoopLen);
            });
            waitCall2.resolve();
            waitCall3.resolve();
        } else if(!rssUrls[2]) {
            infra_fetchRssStories(rssUrls[1]).done(function(data){
                Pn.util.copyArray(data, 0, _rssStories[1], 0, _rssLoopLen);
            }).always(function(){
                waitCall2.resolve();
            });
            waitCall3.resolve();
        } else {
            // half half
            infra_fetchRssStories(rssUrls[1]).done(function(data){
                // even idx
                for(var i=0, j=0; i<_rssLoopLen; i+=2, j++) _rssStories[1][i] = data[j];
            }).always(function(){
                waitCall2.resolve();
            });
            infra_fetchRssStories(rssUrls[2]).done(function(data){
                // odd idx
                for(var i=1, j=0; i<_rssLoopLen; i+=2, j++) _rssStories[1][i] = data[j];
            }).always(function(){
                waitCall3.resolve();
            });
        }

        // set signal
        $.when(waitCall1, waitCall2, waitCall3).done(function(){
            // no harm to call it again and again.
            _rssWaitLoad.resolve();
        });
    }

    function biz_switchStory() {
        // wait until stories are loaded
        $.when(_rssWaitLoad).done(function(){
            biz_hideStory();
            _rssLoopIdx = (_rssLoopIdx + 1) % _rssLoopLen;
            $('footer .aRss .aContent1Story').text(_rssStories[0][_rssLoopIdx]);
            $('footer .aRss .aContent2Story').text(_rssStories[1][_rssLoopIdx]);
            biz_showStory();
        });
    }

    function biz_hideStory() {
        // put transition here
        $('footer .aRss .aContent1Story').hide();
        $('footer .aRss .aContent2Story').hide();
    }

    function biz_showStory() {
        // put transition here
        $('footer .aRss .aContent1Story').show();
        $('footer .aRss .aContent2Story').show();
    }

    function biz_showAtrractLoop() {
        $('main section').hide();
        infra_playAtrractLoopVideo();
        $('main section.aAttractLoopSec').show();
    }

    function biz_showVideoList() {
        // put transition here
        $('main section').hide();
        infra_stopAtrractLoopVideo();
        infra_clearVideoTileSelection();
        infra_showPointer();
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

    function biz_startSession() {
        _sessionId = Pn.util.newGuid();
        biz_hideKeyboard();
        biz_showAtrractLoop();
        // TODO: add tracking
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
            var $this = $(this);

            // select this tile
            infra_clearVideoTileSelection();
            Pn.ui.selected($this, true);

            // hide pointer
            infra_hidePointer();

            // popup
            var needSecond = $this.find('.aBalloon').css('visibility') !== 'hidden';
            var videoUrl = $this.attr(needSecond ? 'data-video-2nd-src' : 'data-video-src');
            biz_playVideo(videoUrl);
        });
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

        // events
        _hookEventHandlers();

        // load video list
        infra_loadVideoListAsync();

        // idle timer
        Pn.idle.start(_config.idleTimeout, biz_startSession);

        // display rss story
        biz_switchStory();
        window.setInterval(biz_switchStory, _config.rssDisplayInterval*1000);

        biz_startSession();
    }

    var app = {
        init:               init,
        start:              start
    };


    // publish ==================================
    window.app = app;

}(Pn, jQuery, this));
