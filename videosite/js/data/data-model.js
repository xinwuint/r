var DataModel = function() {
	this.pageArray = [];
};

DataModel.prototype = function() {
	var	prepareData = function (conf, data) {
        // for an example of structure, see ''
        this.pageArray = {};
        this.pageArray.defaults = conf;
		this.pageArray.videos = { videoslist: _transformVideoMenifest(data) };
	};

	// 'data' comes from videos_en-us.ajax,
	// so need convert to the type that this app needs. 
	var _transformVideoMenifest = function(data) {
		var rst = [];
        if(data) {
            for(var cat in data) {
                if(!data.hasOwnProperty(cat)) continue;
                var l = data[cat];
                if(l && l.length) {
                    for(var i=0; i<l.length; i++) {
                        var v = l[i];
                        if(v) {
                            if(v.videoFile) rst.push({
                            	title: v.title,
                            	link: v.videoFile
                            });
                            if(v.videoSecondaryFile) rst.push({
                            	title: v.title,
                            	link: v.videoSecondaryFile
                            });
                        }
                    }
                }
            }
        }
        return rst;
	};

	return {
		prepareData: prepareData
	};
} ();

var dm = new DataModel();
