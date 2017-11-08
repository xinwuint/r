/*  pn.idle.js
    JS library for idle timeout, ver 0.9
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
    var _checkInterval = 1,     // seconds
        _minTimeout = 1;        // seconds

    // state
    var _enabled = false,   // is idle timer enabled
        _timeout,           // idle timeout seconds
        _cbTimeout,         // callback when idle timeout: function()
        _cbProgress,        // callback to inform progress: function(leftSeconds, timeoutSeconds)
        _obj,               // ref to object created by window.setInterval()
        _lastTime;          // time of user's last action

    function idle_init() {
        // on user's interaction.
        $(document).on('mousedown mouseup mousemove keydown keyup touchstart touchend touchmove', function() {
            if(!_enabled) return;
            _lastTime = new Date();
            if(!_obj) _obj = window.setInterval(_check, _checkInterval * 1000);
        });
    }

    function _check() {
        if(!_enabled) return;
        var elapsed = (new Date() - _lastTime)/1000;
        // not timeout, invoke progress callback
        if(elapsed < _timeout) {
            if(_cbProgress) {
                _cbProgress(Math.ceil(_timeout - elapsed), _timeout);
            }
            return;
        };
        // timeout. clear obj and invoke timeout callback
        _removeTimer();
        _cbTimeout();
    }

    function _removeTimer() {
        if(_obj) {
            window.clearInterval(_obj);
            _obj = null;
        }
    }

    function idle_start(seconds, callbackTimeout, callbackProgress) {
        idle_stop();    // stop previous one
        if(seconds < _minTimeout || !callbackTimeout) return;
        _timeout = seconds;
        _cbTimeout = callbackTimeout;
        _cbProgress = callbackProgress;
        _enabled = true;
    }

    function idle_stop() {
        _enabled = false;
        _removeTimer();
        _cbTimeout = _cbProgress = _lastTime = null;
    }

    function idle_pause() {
        _enabled = false;
    }

    function idle_resume(continueOldCycle) {
        if(!continueOldCycle) _lastTime = new Date();
        _enabled = true;
    }

    var idle = {
        init:   idle_init,
        start:  idle_start,
        stop:   idle_stop,
        pause:  idle_pause,
        resume: idle_resume
    };


    // publish ==================================
    lib.publish(idle, 'idle');

}(Pn, jQuery, this));
