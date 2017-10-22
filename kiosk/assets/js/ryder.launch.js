
// the web starts from here.

;(function (Pn, $, window, undefined) {
    "use strict";

	// init
	Pn.init();
	Pn.ui.init();
	Pn.l10n.init();
	Pn.idle.init();

	// config
	var promiseConfig = $.getJSON('config/config.json');


	$(document).ready(function () {

		$.when(promiseConfig).done(function(conf){
			app.init(conf);
			app.start();
		});
	});

}(Pn, jQuery, this));
