var DataModel = function() {
	this.pageArray = [];
};

DataModel.prototype = function() {
	var	prepareData = function (data) {
		this.pageArray = data;
		app.launch();
	};

	return {
		prepareData: prepareData
	};
} ();

var dm = new DataModel();
