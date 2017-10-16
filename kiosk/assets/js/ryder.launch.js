
// the web starts from here.

;(function (Pn, $, window, undefined) {
    "use strict";

	// init
	Pn.init();
	Pn.ui.init();
	Pn.l10n.init();
	Pn.idle.init();
	app.init();

	// config
	var promiseConfig = $.getJSON('config/config.json');


	$(document).ready(function () {

		$.when(promiseConfig).done(function(conf){
			app.start(conf);
		});
	});

}(Pn, jQuery, this));
