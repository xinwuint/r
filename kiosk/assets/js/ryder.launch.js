
// the web starts from here.

;(function (Pn, $, window, undefined) {
    "use strict";

    // init
    Pn.init();
    Pn.ui.init();
    Pn.l10n.init();
    Pn.idle.init();

    // load config
    var promiseConfig = $.getJSON('config/config.ajax').done(function(conf) {
        // TODO:
        // Below 2 variables should be retrieved from BS player environment.
        // locationId:  could be the sn of each indivisual BS player.
        // locale:      could be calculated by zip or some other info.
        conf.locationId = 'test-location';
        conf.locale = 'en-us';
        et.init(conf.locale, conf.locationId, true);      //tracking
        app.init(conf);
    });


    $(document).ready(function () {

        $.when(promiseConfig).done(function() {
            app.start();
        });
    });

}(Pn, jQuery, this));
