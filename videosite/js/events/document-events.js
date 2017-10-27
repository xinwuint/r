var $templates;
var firstLaunch = true;

$(document).on("ready", function() {
	$templates = $("#templates").clone();
	
	document.getElementById("templates").innerHTML = "";

	dc.loadData("./content/data/data.txt");
	
	window.onhashchange = function() {
		app.handleHashChange(location.hash);
	}
});