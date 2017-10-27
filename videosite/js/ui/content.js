var Content = function() {};

Content.prototype = function() {
	var processPage = function($page) {
			//console.log("Rendering in:", $page)

			$page.find("img, source, video").each(function(i) {
				$(this).attr({src : $(this).attr('data-src')}).removeAttr('data-src');
			});

			//$page = $( $page.html().replace(/data-background-image/g, "background-image") );
			//console.log($page)
			return $page;
		},

		resumeAutoPlay = function($page) {
			$($page).find('video').each(function(i) {
				if ($(this).attr('autoplay')) {
					 $(this).get(0).play();
				}
			});
		}

	return {
		processPage: processPage,
		resumeAutoPlay: resumeAutoPlay
	};
} ();
