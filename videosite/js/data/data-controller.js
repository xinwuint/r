var DataController = function() {};

DataController.prototype = function() {
	var	loadData = function (url) {
			$.ajax({
				url: url,
				dataType: 'json',
				async: true,
				success: function(data) {
					dm.prepareData(data);
					console.log(data)
				}
			});
		}

	return {
		loadData: loadData
	};
} ();

var dc = new DataController();
