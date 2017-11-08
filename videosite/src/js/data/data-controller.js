var DataController = function() {};

DataController.prototype = function() {
	var	loadData = function (url, locale) {
			var d = $.Deferred();
			$.getJSON(url).done(function(conf) {
				// load video list
				var jsonfile = conf.videoAssetPath + '/' + conf.videoManifestFile.replace('{locale}', locale);
				$.getJSON(jsonfile).done(function(data){
					dm.prepareData(conf, data);
					d.resolve();
				});
			});
			return d.promise();
		}

	return {
		loadData: loadData
	};
} ();

var dc = new DataController();
