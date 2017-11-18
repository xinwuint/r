
// the web starts from here.

;(function (Pn, $, window, undefined) {
    "use strict";

    // init
    Pn.init();
    Pn.ui.init();
    Pn.l10n.init();
    Pn.idle.init();

    // load config
    var promiseConfig = $.getJSON('config/config.txt').done(function(conf) {
        // locationId:  Anything unique to kiosk. Could be the sn of each indivisual BS player.
        // locale:      Could be calculated by zip or some other info.
        var locale, locationId;

        // 1 US (English [default]/Spanish)
        // 2 Canada – (English [default]/French)
        // 3 Canada – (French [default]/English)
        var lang = Pn.util.getParameterByName('lang');
        if(lang === '3') locale = 'fr-ca';
        else if(lang === '2') locale = 'en-ca';
        else locale = 'en-us';

        try {
            locationId = (new BSDeviceInfo()).deviceUniqueId;
        } catch(ex) {
            // nothing
        }
        if(!locationId) {
            locationId = Pn.util.getParameterByName('sn') || 'test-location';
        }

        et.init(locale, locationId, true);      //tracking
        conf.locale = locale;
        conf.locationId = locationId;
        app.init(conf);
    });


    $(document).ready(function () {

        $.when(promiseConfig).done(function() {
            app.start();
        });
    });

}(Pn, jQuery, this));
