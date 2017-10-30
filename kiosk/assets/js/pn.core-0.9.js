/*  pn.core.js
    A JS Library, ver 0.9
    Created by Xin Wu, 2017-09-25

    Dependency: 
        jQuery 1.8+
*/

/*
    root
        void    init([obj:options]);                // init lib, can only execute once.
        bool    debugMode([bool:value]);            // get or set debug mode
    util
        bool    isNullOrUndefined(obj);
        bool    isJqueryObject(obj);
        bool    isDomNode(obj);
        bool    isDomElement(obj);
        bool    isPromise(obj);
        bool    isWorkflowContinuable(obj);         // the value of obj controls continuing or not.
        obj     deref(obj, callContext, [obj]:callParams);
        number  randomInRange(number:min, number:max);
        jqObj   createJqueryObjectWithOneElement((string|domObj|jqObj):obj);
        string  escapeRegex(string:text);
        string  fetch(string:text, (string|RegExp):regex, int:groupIdx);
        string|null|undefined  trim(string:text);
        string  ellipsis(obj, int:max);      // truncate string and append ellipsis
        string  getParameterByName(string:name[, string:url]);
        array   createArray([int]:lengths, any:value);  // create multi-dimensional array which is defined by length of each dimension. value is init value for elements.
        string  newGuid();
        promise checkConnectivity();                    // check internet connectivity. eg: checkConnectivity().done(function(isOnline){...})
        void    publish(obj[, string:namespace]);
    ajax
        jqXHR   ajax();   // same as $.ajax()
        jqXHR   get();    // same as $.get()
        jqXHR   post();   // same as $.post()
    flow
        // Execute each function in a pipeline way. Output of prev function will be input to next function. Function in [] will work as a control, like valve.
        // Example: execPipe([f1, [f2], f3, [f4], f5], ['hello', 5, 'world']);
        // f1 takes 'hello', 5 and 'world' as 3 arguments, output goes to f2, for example, 'I am xin'.
        // f2 takes whatever passed from f1, return a control flag.
        // A "control flag" could be Promise or any other obj. If it is obj, and (!!obj) is false, execution stops as a failure. If (!!obj) is true, passes output from
        //      f1, in this case 'I am xin', to f3, and continue execution.
        // If every thing is ok, the state of returned Promise of "execPipe" will be "resolved", otherwise "rejected".
        Promise execPipe([funciton(any)], [any]);
*/

;(function ($, window, undefined) {
    // const =====================================================================================
    var _slice = Array.prototype.slice.call;

    // construct/init/setting ====================================================================
    var _settings = {
        debugMode: false
    };

    function root_init(options) {
        if(options) $.extend(true, _settings, options);
    };

    function root_debugMode() {
        if (arguments.length > 0) _settings.debugMode = !!(arguments[0]);
        return _settings.debugMode;
    }

    function root_publish(obj, namespace) {
        var list = !namespace ? [] : namespace.split('.');
        var c = lib;
        $.each(list, function(i, v) {
            if (!v) return;
            if (c[v] === undefined || c[v] === null) c[v] = {};
            c = c[v];
        });
        $.extend(true, c, obj);
    }


    // util ======================================================================================
    function util_isNullOrUndefined(obj) {
        return obj === undefined || obj === null;
    }

    function util_isJqueryObject(obj) {
        return obj && (obj instanceof $);
    }

    function util_isDomNode(obj) {
        return (typeof Node === 'object') ? obj instanceof Node :
            (obj && typeof obj === 'object' && typeof obj.nodeType === 'number' && typeof obj.nodeName === 'string');
    }

    function util_isDomElement(obj) {
        return util_isDomNode(obj) && obj.nodeType === 1;
    }

    function util_isPromise(obj) {
        // quick-and-dirty solution
        return obj && $.isFunction(obj.then);
    }

    function util_isWorkflowContinuable(obj) {
        return util_isNullOrUndefined(obj) ? true : !!obj;
    }

    function util_deref(obj, callContext, callParams) {
        return $.isFunction(obj) ? obj.apply(callContext, callParams) : obj;
    }

    function util_randomInRange(a, b) {
        return Math.min(a, b) + Math.floor(Math.random() * (Math.abs(b - a) + 1));
    }

    function util_createJqueryObjectWithOneElement(obj) {
        var jq = util_isJqueryObject(obj) ? obj : $(obj);
        return jq.length > 1 ? $(jq[0]) : jq;
    }

    // text related
    function util_escapeRegex(text) {
        return text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    // text related. groupIdx is optional
    function util_fetch(text, regex, groupIdx) {
        if(!text && text !== '') return null;     // anything negative except empty string
        regex = typeof regex === 'string' ? new RegExp(regex) : regex;
        groupIdx = groupIdx || 0;
        var m = regex.exec(text);
        return (m && m.length > groupIdx) ? m[groupIdx] : null;
    }

    // text related.
    function util_trim(text) {
        return !text ? text : text.trim();
    }

    // text related.
    function util_ellipsis(text, max) {
        if(!text) return '';
        text = text.toString();
        if(text.length <= max) return text;
        return text.substr(0, max-3) + '...';
    }

    // text related
    function util_getParameterByName(name, url) {
        if (!name) return '';
        url = url || window.location.href;
        var regex = new RegExp('[\\?&]' + util_escapeRegex(name) + '=([^&#]*)', 'ig');
        var rst = regex.exec(url);
        return rst ? decodeURIComponent(rst[1].replace(/\+/g, ' ')) : '';
    };

    // collection related
    function _newArray(lengths, dimensionIdx, value) {
        var arr = [];
        var lastDim = dimensionIdx === lengths.length - 1;
        for(var i = 0; i < lengths[dimensionIdx]; i++) arr.push(lastDim ? value : _newArray(lengths, dimensionIdx+1, value));
        return arr;
    }

    // collection related
    function util_createArray(lengths, value) {
        return !lengths || !lengths.length ? _newArray([0], 0, value) : _newArray(lengths, 0, value);
    }

    function util_copyArray(srcArr, srcOffset, dstArr, dstOffset, count) {
        if(srcArr && srcArr.length && srcOffset >= 0 && srcOffset < srcArr.length && dstArr && dstArr.length && dstOffset >= 0 && dstOffset < dstArr.length && count > 0) {
            for(var i = 0; i < count; i++) dstArr[dstOffset + i] = srcArr[srcOffset + i];
        }
    }

    // alg related
    function util_newGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // net related
    function util_checkUrlAvail(url) {
        var d = $.Deferred();
        ajax_ajax({
            url: url,
            method: "HEAD",
            cache: false
        }).done(function(){
            d.resolve(true);
        }).fail(function(){
            d.resolve(false);
        });
        return d.promise();
    }

    // net related
    function util_checkConnectivity() {
        var landmarks = ["https://www.google.com/", "https://www.bing.com/", "https://search.yahoo.com/"];
        var d = $.Deferred();
        var handles = [];
        var failureCnt = 0;

        var _done = function(avail) {
            if(!handles) return;    // already settled down
            if(avail) {
                for(var i = 0; i < landmarks.length; i++) {
                    try {
                        handles[i].abort();
                    } catch(err) {}
                }
                handles = null;
                d.resolve(true);
            } else {
                failureCnt++;
                if(failureCnt === landmarks.length) {
                    handles = null;
                    d.resolve(false);
                }
            }
        };

        for(var i = 0; i < landmarks.length; i++) {
            handles.push(util_checkUrlAvail(landmarks[i]).done(_done));
        }
        return d.promise();
    }

    var util = {
        isNullOrUndefined:                  util_isNullOrUndefined,
        isJqueryObject:                     util_isJqueryObject,
        isDomNode:                          util_isDomNode,
        isDomElement:                       util_isDomElement,
        isPromise:                          util_isPromise,
        isWorkflowContinuable:              util_isWorkflowContinuable,
        deref:                              util_deref,
        randomInRange:                      util_randomInRange,
        createJqueryObjectWithOneElement:   util_createJqueryObjectWithOneElement,
        escapeRegex:                        util_escapeRegex,
        fetch:                              util_fetch,
        trim:                               util_trim,
        ellipsis:                           util_ellipsis,
        getParameterByName:                 util_getParameterByName,
        createArray:                        util_createArray,
        copyArray:                          util_copyArray,
        newGuid:                            util_newGuid,
        checkConnectivity:                  util_checkConnectivity
    };


    // ajax ======================================================================================
    function ajax_ajax() {
        return $.ajax.apply($, arguments);
    };

    function ajax_get() {
        return $.get.apply($, arguments);
    };

    function ajax_post() {
        return $.post.apply($, arguments);
    };

    //// TODO: submit form in ajax way
    //function ajax_submit() {}

    var ajax = {
        ajax:   ajax_ajax,
        get:    ajax_get,
        post:   ajax_post
    };


    // flow ======================================================================================
    function flow_getPromiseValue(obj) {
        if(!util_isPromise(obj) || obj.state() == 'pending') return undefined;
        var v;
        var f = function() {
            v = _slice(arguments);
        };
        obj.then(f, f); // a sync call, because it is not pending
        return v;
    }

    // once drained, nothing happens when call join() and valve()
    var Pipe = function(funcs) {
        // if not 'new', return 'new'
        if(!(this instanceof Pipe)) return funcs ? new Pipe(funcs) : new Pipe();

        var me = this;
        var list = funcs ? $.merge([], funcs) : [];
        var waiting = 0;    // 0: no waiting, 1: waiting for normal func, 2: waiting for control
        var lv = [];        // value retured from prev function and will be passed to next function
        var started = false;
        var d = $.Deferred();

        // add a function as one step in the pipe
        me.join = function(func) {
            if(!started) list.push(func);
            return me;
        };

        // add a function as one control in the pipe
        me.valve = function(func) {
            if(!started) list.push([func]);
            return me;
        };

        // start execution. inputs is the arguments for the 1st function
        me.drain = function(inputs) {
            if(!started) {
                started = true;
                lv = $.merge([], arguments);
                _start();
            }
            return d.promise();
        };

        var _next = function() {
            var i = list.shift();
            return $.isArray(i) ? [i[0], 2] : [i, 1];
        };

        var _start = function() {
            if(waiting != 0) return;
            var good = true;
            while(list.length != 0) {
                var item = _next();
                if(!item[0]) continue;
                var r = item[0].apply(null, lv);
                if(item[1] == 1) {  // normal func
                    if(util_isPromise(r)) {
                        if(r.state() == 'pending') {
                            waiting = 1;
                            r.then(_continue, _end);
                            break;
                        } else {
                            lv = flow_getPromiseValue(r);
                            if(r.state() == 'rejected') {
                                good = false;
                                break;
                            }
                        }
                    } else {
                        lv = r == undefined ? [] : [r];
                    }
                } else {    // control
                    if(util_isPromise(r)) {
                        if(r.state() == 'pending') {
                            waiting = 2;
                            r.then(_continue, _end);
                            break;
                        } else if(r.state() == 'rejected') {
                            lv = flow_getPromiseValue(r);
                            good = false;
                            break;
                        }
                    } else {
                        if(r != undefined && r != null && !r) {
                            lv = [];
                            good = false;
                            break;
                        }
                    }
                }
            }
            if(!good) d.reject.apply(d, lv);
            else if(waiting == 0 && list.length == 0) d.resolve.apply(d, lv);
        };

        var _continue = function() {
            if(waiting == 1) lv = $.merge([], arguments);
            waiting = 0;
            _start();
        };

        var _end = function() {
            lv = $.merge([], arguments);
            d.reject.apply(d, lv);
        };
    }

    function flow_execPipe(funcs, args) {
        args = args || [];
        var pipe = Pipe(funcs);
        return pipe.drain.apply(pipe, args);
    };

    // execute functions one bye one.
    // this is equvalent to replace jQuery queue, but handle Promise
    var Sequence = function() {
        // if not 'new', return 'new'
        if(!(this instanceof Sequence)) return new Sequence();

        var me = this;
        var list = [];
        var running = false; // indicate the execution of one func is in progress

        me.enqueue = function(func) {
            list.push(func);
            _start();
            return me;
        };

        var _start = function() {
            if(running) return;
            running = true;
            var waiting = false;
            while(list.length != 0) {
                var r = list.shift()(); // in func, enqueue() won't execute _start() again due to variable 'running'
                if(util_isPromise(r) && r.state() == 'pending') {
                    r.then(_continue, _continue);
                    waiting = true;
                    break;
                }
            }
            if(!waiting) running = false;
        };

        var _continue = function() {
            running = false;
            _start();
        };
    };

    // TODO
    //function isWaitEvent(obj){
    //    return !isNullOrUndefined(obj) && $.isFunction(obj.signal);
    //}
    //var token = {};
    //WaitEvent = function(){
    //    if(!(this instanceof WaitEvent)) return new WaitEvent();
    //    var me = this;
    //    var p = {};   // private data
    //    p.d = $.Deferred();
    //    p.chain = p.d;
    //    me.invite = function(func){ 
    //        p.chain = p.chain.then(function(){
    //            var v = func();
    //            return isWaitEvent(v) ? v.valueOf.call(token).d : null;
    //        });
    //        return me;
    //    };
    //    me.signal = function(){ 
    //        p.d.resolve();
    //        return me;
    //    };
    //    me.wrap = function(){ 
    //        return { invite: me.invite };
    //    };
    //    me.isSignaled = function(){ 
    //        return p.d.state() == 'resolved';
    //    };
    //    me.valueOf = function(){  // override
    //        return this === token ? p : me.__proto__.valueOf.call(me);
    //    };
    //}

    var flow = {
        execPipe:   flow_execPipe
    };


    // local lib ======================================================================================
    var lib = {
        init:       root_init,
        debugMode:  root_debugMode,
        publish:    root_publish,
        util:       util,
        ajax:       ajax,
        flow:       flow
    };


    // global work ====================================================================================
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(ele) {
            for (var i = 0, n = this.length; i < n; i++) {
                if (this[i] === ele) return i;
            }
            return -1;
        }
    }


    // publish ======================================================================================
    if (window.Pn) $.extend(true, window.Pn, lib);
    else window.Pn = lib;

} (jQuery, this));
