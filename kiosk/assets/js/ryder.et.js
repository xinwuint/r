/*  ryder.et.js
    JS library for evnet tracking, ver 0.9
    Created by Xin Wu, 2017-09-25

    Dependency:
        jQuery 1.8+
        pn.core.js
*/

/*
    idle
        void    init();
        void    start(seconds, callbackTimeout, callbackProgress);
        void    stop();
        void    pause();
        void    resume(bool:continueOldCycle);  // continueOldCycle=true means take into account the idle time before pause 

    Mode details:
        This is only for a scenario of idle, it is not a simple timer.
        Two states are considered, 'active' and 'idle'. Only the switching from 'active' to 'idle' will trigger the callback.
        Any action on browser (mousemove keyup keydown mousedown click) will bring it back to 'active' state.
*/

;(function (lib, $, window, undefined) {
    // const =====================================================================================
    var KIOSK = 'kiosk',
        VIDEOSITE = 'mobile',
        EN = 'en',
        FR = 'fr',
        ES = 'es';

    // state
    var _videoLangs, _locationId, _siteId;

    function et_init(locale, locationId, isKiosk) {
        if(locale === 'fr-ca') {
            _videoLangs = [FR, EN];
        } else if(locale === 'en-ca') {
            _videoLangs = [EN, FR];
        } else {    // 'en-us'
            _videoLangs = [EN, ES];
        }

        _locationId = locationId || '';
        _siteId = isKiosk ? KIOSK : VIDEOSITE;
    }

    function et_startSession() {
    }

    function et_endSession() {
    }

    function et_playVideo(clipId, isFirstLang) {
    }

    var et = {
    };


    // publish ==================================
    //lib.publish(idle, 'idle');

}(Pn, jQuery, this));
