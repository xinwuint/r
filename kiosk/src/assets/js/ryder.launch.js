
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
        var locale, locationId, zip;

        // get zip
        zip = Pn.util.getParameterByName('zip').replace(/\s+/, '').toLowerCase();

        // calculate locale
        if (/^(\w\d){3}$/.test(zip)) {
            // canada postal code
            locale = zip.startsWith('j') || zip.startsWith('g') || (zip.startsWith('h') && zip !== 'h0h0h0') ? 'fr-ca' : 'en-ca';
        } else {
            locale = 'en-us';
        }

        // get locationid
        locationId = 'test-location';

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
