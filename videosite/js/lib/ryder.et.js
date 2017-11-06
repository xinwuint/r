/*  ryder.et.js
    JS library for evnet tracking, ver 0.9
    Created by Xin Wu, 2017-09-25

    Dependency:
        jQuery 1.8+
        pn.core.js
*/

/*
    et
        void    init(string:locale, string:locationId, boolean:isKiosk);
        void    startSession();
        void    endSession();
        void    playVideo(string:videoFilename, boolean:isFirstLang);
*/

;(function (Pn, $, window, undefined) {
    // const =====================================================================================
    var URL = 'https://www.google-analytics.com/collect',
        TRACKINGID = 'UA-107958999-1';     // ryder
    var KIOSK = 'kiosk',
        VIDEOSITE = 'mobile',
        EN = 'en',
        FR = 'fr',
        ES = 'es';

    // state
    var _videoLangs, _locationId, _siteType, _sessionId;

    function _genSessionId() {
        return Pn.util.newGuid();
    }

    function et_init(locale, locationId, isKiosk) {
        if(locale === 'fr-ca') {
            _videoLangs = [FR, EN];
        } else if(locale === 'en-ca') {
            _videoLangs = [EN, FR];
        } else {    // 'en-us'
            _videoLangs = [EN, ES];
        }

        _locationId = locationId || 'no-location';
        _siteType = isKiosk ? KIOSK : VIDEOSITE;
    }

    function et_startSession() {
        _sessionId = _genSessionId();
        $.ajax({
            url: URL,
            method: 'POST',
            data: {
                v: '1',
                tid: TRACKINGID,
                cid: _sessionId, // use session id as user id, coz did not defined 'user'.
                t: 'event',
                ec: 'Session',
                ea: 'Start',
                sc: 'start',
                cd2: _locationId,
                cd4: 'Overall',
                ds: _siteType  // data source
            }
        });
    }

    function et_endSession() {
        if(!_sessionId) return;
        $.ajax({
            url: URL,
            method: 'POST',
            data: {
                v: '1',
                tid: TRACKINGID,
                cid: _sessionId, // use session id as user id, coz did not defined 'user'.
                t: 'event',
                ec: 'Session',
                ea: 'End',
                sc: 'end',
                cd2: _locationId,
                cd4: 'Overall',
                ds: _siteType  // data source
            }
        });
    }

    function et_playVideo(videoFilename, isFirstLang) {
        $.ajax({
            url: URL,
            method: 'POST',
            data: {
                v: '1',
                tid: TRACKINGID,
                cid: _sessionId, // use session id as user id, coz did not defined 'user'.
                t: 'event',
                ec: 'Video',
                ea: 'Watch',
                el: videoFilename,
                cd1: isFirstLang ? _videoLangs[0] : _videoLangs[1],
                cd2: _locationId,
                cd3: videoFilename,
                ds: _siteType  // data source
            }
        });
    }

    var et = {
        init:               et_init,
        startSession:       et_startSession,
        endSession:         et_endSession,
        playVideo:          et_playVideo
    };


    // publish ==================================
    window.et = et;

}(Pn, jQuery, this));
