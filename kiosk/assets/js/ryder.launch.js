
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
		app.init(conf);
	});


	$(document).ready(function () {

		$.when(promiseConfig).done(function() {
			app.start();
		});
	});

}(Pn, jQuery, this));
