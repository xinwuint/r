var $templates;
var firstLaunch = true;

$(document).on("ready", function() {
	var locale = 'en-us';
	var locationId = 'test-location';   // the user comes here from which kiosk

	// init
	Pn.init();
	Pn.l10n.init();
	// param
	locale = Pn.util.getParameterByName('locale') || locale;
	locationId = Pn.util.getParameterByName('locationId') || locationId;
	// localize
	locale = Pn.l10n.locale(locale);
	// init tracking
	et.init(locale, locationId, false);

	$templates = $("#templates").clone();
	
	document.getElementById("templates").innerHTML = "";

	dc.loadData("./config/config.ajax", locale).done(function() {
		app.launch();
	});
	
	window.onhashchange = function() {
		app.handleHashChange(location.hash);
	}
});