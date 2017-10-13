

//TODO


    // state
    var _state = {
        shimImageUrl: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
    };




    // file not found functionaliy start ===========
    function util_fireLoadingDone(obj) {
        // could used in js like "ele.onload = onLoadingDone;"
        obj = lib.util.isDomElement(this) ? this : obj;
        $(obj).trigger('loadingDone');
    }

    function util_fireLoadingError(obj) {
        obj = lib.util.isDomElement(this) ? this : obj;
        $(obj).trigger('loadingError');
    }

    function util_onLoadingDone(obj) {
        // could used in js like "ele.onload = onLoadingDone;"
        obj = lib.util.isDomElement(this) ? this : obj;
        $(obj).prop('_loadComplete', 1);
    }

    function util_onLoadingError(obj) {
        obj = lib.util.isDomElement(this) ? this : obj;
        $(obj).prop('_loadComplete', 2);
    }

    function util_checkExhaustingLoading(obj, attrName, onComplete) {
        var ele = lib.util.isJqueryObject(obj) ? obj : $(obj);
        attrName = attrName ? ($.isArray(attrName) ? attrName : [attrName]) : [];
        ele.each(function (idx) {
            if (!!this._loadAlts) return;
            var $this = $(this);
            var alts = {
                arr: attrName,
                i: 0,
                callback: onComplete,
                onerror: function () {
                    //console.log(this.src + ' failed');
                    var alts = this._loadAlts;
                    if (!alts) return;
                    var $this = $(this);

                    while (alts.i < alts.arr.length) {
                        var t = $this.attr(alts.arr[alts.i++]);
                        if (t) {
                            $this.attr('src', t);
                            return;
                        }
                    }

                    $this.off('error', alts.onerror).off('load', alts.onload);
                    //$this.off('load', alts.onload); if it is not "one"
                    var cb = alts.callback;
                    delete this._loadAlts;
                    if (cb) cb.apply(this, [false]);

                },
                onload: function () {
                    //console.log(this.src + ' successful');
                    var alts = this._loadAlts;
                    if (!alts) return;
                    $(this).off('error', alts.onerror);
                    var cb = alts.callback;
                    delete this._loadAlts;
                    if (cb) cb.apply(this, [true]);
                }
            };

            var lc = this._loadComplete || 0;
            //console.log(this.id + ".loadComplete=" + lc);
            if (lc == 1) {
                if (onComplete) onComplete.apply(this, [true]);
            } else {
                this._loadAlts = alts;
                this.onerror = "";  // if do not apply this, onerror will be triggered. Seems like $this.off('error') wont touch this.onerror
                this.onload = "";
                //$this.off('error').off('load').on('error', this._loadAlts.onerror).one('load', this._loadAlts.onload);
                $this.on('error', this._loadAlts.onerror).one('load', this._loadAlts.onload);
                //console.log(this.id + " fk: " + $this.attr('src'));
                if (lc == 2 || !$this.attr('src')) {
                    $this.trigger('error');
                    //console.log(this.id + " trigger error");
                }
            }
            delete this._loadComplete;
        });
    }
    // file not found functionaliy end ===========

    // img not found
    // data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
    $(document).on('loadingError', function (event) {
        //console.log('loadingError: target=' + event.target.id + ' tagName=' + event.target.tagName);
        var tagname = event.target.tagName.toLowerCase();
        if (tagname == "img") {
            var t = $(event.target);
            var ori = t.attr('src');
            t.attr('data-srcori', ori).attr('src', settings.applicationPath + settings.shimImgRelativePath).addClass('uImageNotFound');

        } else if (tagname == "image") { // for svg image
            var t = $(event.target);
            var p = t.parent();
            if (p.prop("tagName").toLowerCase() == 'svg') {
                var ori = t.attr('xlink:href');
                t.attr('data-srcori', ori).attr('xlink:href', settings.applicationPath + settings.shimImgRelativePath);
                p.addClass('uImageNotFound');   // css works on <svg>, not on <image>
            }
        }
    });



