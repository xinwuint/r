
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

        var lang = Pn.util.getParameterByName('lang').toLowerCase();
        lang = Pn.util.trim(lang);
        if(lang === 'fr-ca') locale = 'fr-ca';
        else if(lang === 'en-ca') locale = 'en-ca';
        else locale = 'en-us';

        var locationId = Pn.util.getParameterByName('location');
        locationId = Pn.util.trim(locationId);
        if(!locationId) {
            try {
                // get SN of device
                locationId = (new BSDeviceInfo()).deviceUniqueId;
            } catch(ex) {
                // nothing
            }
        }
        if(!locationId) {
            // fall to default
            locationId = 'test-location';
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
