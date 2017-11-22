/*  pn.ui.js
    JS Library for UI, ver 0.9
    Created by Xin Wu, 2017-09-25

    Dependency:
        jQuery 1.8+
        pn.core.js
*/

/*
    ui
        void        init([obj:options]]);                       // init lib, can only execute once.
        string      newline(string:value);                      // get or set newline
        Promise     warn(string:title, string:message);         //e.g. warn("Error", "Something is wrong.").then(function(sBtnName){ alert("clicked on " + sBtnName); }); sBtnName is in ['ok','no','cancel']
        Promise     confirm(string:title, string:message, string:cancelBtnCaption, string:okBtnCaption);
        void        displayLoading(bool:display, string:message);
        Promise     scrollTo((string|domObj|jqObj):element, int:duration);
        object      openPopup((string|domObj|jqObj):eleToPopup, bool:blockUi, bool:closeOnOverlay, function():onLaunched, function():onClosed);
        void        closePopup(object:popObj);
        void        fireReturnEvent((string|domObj|jqObj):element, object:data);
        Promise     popupModal((string|domObj|jqObj):eleToPopup, object:launchOpt);
        Promise     popupModalAjax((string|domObj|jqObj):eleToPopup, (string|object):ajaxOpt, (string|object):mountOpt, (string|object):launchOpt);
        Promise     popupModalAir((string|object):ajaxOpt, (string|object):mountOpt, (string|object):launchOpt);
        Promise     loadAjax((string|object):ajaxOpt, (string|object):mountOpt);
        boolean     selected((string|domObj|jqObj):element, [boolean:isSelected]);      // get or set 'selected' attribute to element
        boolean     toggleSelected((string|domObj|jqObj):element);                      // reverse 'selected' attribute to element
        boolean     disabled((string|domObj|jqObj):element, [boolean:isDisabled]);      // get or set 'disabled' attribute to element
        boolean     toggleDisabled((string|domObj|jqObj):element);                      // reverse 'disabled' attribute to element
*/

;(function (lib, $, window, undefined) {
    // const =====================================================================================
    var OK = 'ok', CANCEL = 'cancel';

    // settings ================================================================================
    var _settings = {
        newline: '\n'
    };

    function ui_init(options) {
        if(options) $.extend(true, _settings, options);
    }

    function ui_newline(char) {
        if(char || char === '') _settings.newline = char;
        return _settings.newline;
    }

    // ui ======================================================================================
    function ui_warn(title, message) {
        window.alert(title + _settings.newline + _settings.newline + message);
        return $.when(OK);
    }

    function ui_confirm(title, message, cancelBtnCaption, okBtnCaption) {
        var rst = window.confirm(title + _settings.newline + _settings.newline + message);
        return $.when(rst ? OK : CANCEL);
    }

    function ui_displayLoading(display, message) {
        // Nothing. This function is just a placeholder.
        // todo: Do we really need this function here?
    }

    function ui_scrollTo(element, duration) {
        duration = duration || duration === 0 ? duration : 1000; //default 1 sec
        var ele = lib.util.isJqObj(element) ? element : $(element);
        var d = $.Deferred();
        var $body = (window.opera) ? (document.compatMode == "CSS1Compat" ? $('html') : $('body')) : $('html,body'); // by willin
        $body.animate({ scrollTop: ele.offset().top }, duration, null, function () {
            d.resolveWith(ele);
        });
        return d.promise();
    }

    function ui_openPopup(eleToPopup, blockUi, closeOnOverlay, onLaunched, onClosed) {
        var ele = lib.util.createOneElementJqObj(eleToPopup);
        if (ele.length == 0) return null;    // work on only one element

        var modalClose = lib.util.isNullOrUndefined(closeOnOverlay) ? true : !!closeOnOverlay;   // explicitly set default to true, in case escClose has a different default
        return ele.bPopup({
            modal: blockUi,
            modalClose: modalClose,
            escClose: modalClose,
            onClose: onClosed,
            positionStyle: 'absolute', //'fixed',
            position: [300, 180], 
            follow: [false, false]
        }, onLaunched);
    };

    function ui_closePopup(popObj) {
        if (popObj) popObj.close();
    };


    // modal popup ============================================================================
    // For any reason the modal can not display, it means failure.
    // Once user responses, no matter clicking or closing, it means return.
    // TODO: support clone? clone eleToPop? clone sourceElement? clone event handler?

    var _mountOptDefault = {
        sourceElementSelector: null,
        targetContainer: null,
        onMounting: null
        // There is no 'onMounted'. It is equivalent to 'launchOpt.onLaunching'
    };
    var _launchOptDefault = {
        closeButtonSelector: null,
        blockUi: true,
        overlayClose: true,
        //overlayColor: null,
        //overlayOpacity: null,
        onLaunching: null,
        onLaunched: null,
        onClosing: null,
        dataReturnedWhenDismiss: undefined
        // There is no 'onClosed'. It is handled by promise pattern.
    };
    var _eventtype_return = '_component_event_return';

    function ui_fireReturnEvent(element, data) {
        var ele = lib.util.isJqObj(element) ? element : $(element);
        ele.trigger(_eventtype_return, [data]);
    }

    // TODO: need this?
    // function ui_registerComponentHandlers(element, returnHandler) {
    //     var ele = lib.util.isJqObj(element) ? element : $(element);
    //     if (typeof returnHandler === 'function') ele.on(_eventtype_return, returnHandler);
    // }
    // function ui_unregisterComponentHandlers(element, returnHandler) {
    //     var ele = lib.util.isJqObj(element) ? element : $(element);
    //     if (returnHandler === '*') ele.off(_eventtype_return);
    //     else if (typeof returnHandler === 'function') ele.off(_eventtype_return, returnHandler);
    // }

    function ui_popupModal(eleToPopup, launchOpt) {
        // launchOpt. primary property is 'closeButtonSelector'
        launchOpt = typeof launchOpt === 'string' ? { closeButtonSelector : launchOpt } : launchOpt;
        launchOpt = $.extend(true, {}, _launchOptDefault, launchOpt);

        // init and validate
        var ele = lib.util.createOneElementJqObj(eleToPopup);
        var d = $.Deferred();
        if(ele.length == 0) {
            d.rejectWith(null);
            return d.promise();
        }
        var hasCloseBtn = !!launchOpt.closeButtonSelector;
        var objPop = null;
        var returnedData;
        var dismissed = true;     // this is needed by _cleanup, otherwise you can not tell if overlay is clicked. default must be true;

        // popup handler and cleanup
        var _dismissHandler = function(e) {     // no user data will be passed from param
            var rst = lib.util.deref(launchOpt.onClosing, ele[0], [launchOpt.dataReturnedWhenDismiss]);
            if(lib.flow.isContinuable(rst)) {
                ui_closePopup(objPop);
            }
            return false; // prevent bubbling
        };
        var _returnHandler = function(e, data) {
            var rst = lib.util.deref(launchOpt.onClosing, ele[0], [data]);
            if(lib.flow.isContinuable(rst)) {
                dismissed = false;
                returnedData = data;
                ui_closePopup(objPop);
            }
            return false; // prevent bubbling
        };
        var _cleanup = function() {
            if(hasCloseBtn) ele.off('click', launchOpt.closeButtonSelector, _dismissHandler);
            ele.off(_eventtype_return, _returnHandler);
            if(dismissed) d.resolveWith(ele[0], launchOpt.dataReturnedWhenDismiss);
            else d.resolveWith(ele[0], returnedData);
        };

        // onLaunched
        var f_onlaunched = function() {
            var rst = lib.util.deref(launchOpt.onLaunched, ele[0], null);
        };
        // onLaunching
        var f1 = function() {
            return launchOpt.onLaunching ? launchOpt.onLaunching.apply(ele[0], null) : null;
        };
        // launch
        var f2 = function() {
            ele.on(_eventtype_return, _returnHandler);
            if (hasCloseBtn) ele.on('click', launchOpt.closeButtonSelector, _dismissHandler);
            objPop = ui_openPopup(ele, launchOpt.blockUi, launchOpt.overlayClose, f_onlaunched, _cleanup);
        };

        lib.flow.execPipe([[f1], f2]).fail(function() {
            // only need to handle fail
            d.rejectWith.apply(d, $.merge([ele[0]], arguments));
        });

        // return promise
        return d.promise();
    }

    function ui_popupModalAjax(eleToPopup, ajaxOpt, mountOpt, launchOpt) {
        // ajaxOpt. primary property is 'url'
        ajaxOpt = typeof ajaxOpt === 'string' ? { url : ajaxOpt } : ajaxOpt;
        // mountOpt. primary property is 'sourceElementSelector'
        mountOpt = typeof mountOpt === 'string' ? { sourceElementSelector : mountOpt } : mountOpt;
        mountOpt = $.extend(true, {}, _mountOptDefault, mountOpt);
        // launchOpt. primary property is 'closeButtonSelector'
        launchOpt = typeof launchOpt === 'string' ? { closeButtonSelector : launchOpt } : launchOpt;
        launchOpt = $.extend(true, {}, _launchOptDefault, launchOpt);

        // init and validate
        var ele = lib.util.createOneElementJqObj(eleToPopup);
        var tmp = mountOpt.targetContainer;
        var tContainer = !tmp ? ele : lib.util.isJqObj(tmp) ? tmp : ele.find(tmp);
        var d = $.Deferred();
        if(ele.length == 0 || tContainer.length == 0) {
            d.rejectWith(null);
            return d.promise();
        }
        var hasCloseBtn = !!launchOpt.closeButtonSelector;
        var objPop = null;
        var returnedData;
        var dismissed = true;     // this is needed by _cleanup, otherwise you can not tell if overlay is clicked. default must be true;

        // popup handler and cleanup
        var _dismissHandler = function(e) {     // no user data will be passed from param
            var rst = lib.util.deref(launchOpt.onClosing, ele[0], [launchOpt.dataReturnedWhenDismiss]);
            if(lib.flow.isContinuable(rst)) {
                ui_closePopup(objPop);
            }
            return false; // prevent bubbling
        };
        var _returnHandler = function(e, data) {
            var rst = lib.util.deref(launchOpt.onClosing, ele[0], [data]);
            if(lib.flow.isContinuable(rst)) {
                dismissed = false;
                returnedData = data;
                ui_closePopup(objPop);
            }
            return false; // prevent bubbling
        };
        var _cleanup = function() {
            if(hasCloseBtn) ele.off('click', launchOpt.closeButtonSelector, _dismissHandler);
            ele.off(_eventtype_return, _returnHandler);
            tContainer.empty();
            if(dismissed) d.resolveWith(ele[0], launchOpt.dataReturnedWhenDismiss);
            else d.resolveWith(ele[0], returnedData);
        };

        // onLaunched
        var f_onlaunched = function() {
            var rst = lib.util.deref(launchOpt.onLaunched, ele[0], null);
        };
        // ajax
        var f1 = function() {
            return lib.ajax.ajax(ajaxOpt);
        };
        // onMounting
        var f2 = function() {
            return mountOpt.onMounting ? mountOpt.onMounting.apply(ele[0], arguments) : null;
        };
        // mount
        var f3 = function(data, textStatus, jqXHR) {
            if (mountOpt.sourceElementSelector) {
                var e = $('<div />').html(data).find(mountOpt.sourceElementSelector);
                tContainer.html(e.length > 0 ? e[0].outerHTML : null);
            } else tContainer.html(data);
        };
        // onLaunching
        var f4 = function() {
            return launchOpt.onLaunching ? launchOpt.onLaunching.apply(ele[0], null) : null;
        };
        // launch
        var f5 = function() {
            ele.on(_eventtype_return, _returnHandler);
            if (hasCloseBtn) ele.on('click', launchOpt.closeButtonSelector, _dismissHandler);
            objPop = ui_openPopup(ele, launchOpt.blockUi, launchOpt.overlayClose, f_onlaunched, _cleanup);
        };

        lib.flow.execPipe([f1, [f2], f3, [f4], f5]).fail(function() {
            d.rejectWith.apply(d, $.merge([ele[0]], arguments));
        });

        // return promise
        return d.promise();
    }

    function ui_popupModalAir(ajaxOpt, mountOpt, launchOpt) {
        // mountOpt. primary property is 'sourceElementSelector'
        if(typeof mountOpt === 'object') {
            mountOpt = $.extend(true, {}, mountOpt, {targetContainer: null});
        }

        var ele = $('<div style="display:none;"></div>').appendTo(document.body);
        return ui_popupModalAjax(ele, ajaxOpt, mountOpt, launchOpt)
            .always(function () {
                // ele.empty() is done inside ui_popupModalAjax;
                ele.remove();
            });
    }

    // there is no 'onMounted'. It is done by promise pattern.
    function ui_loadAjax(ajaxOpt, mountOpt) {
        // ajaxOpt. primary property is 'url'
        ajaxOpt = typeof ajaxOpt === 'string' ? { url : ajaxOpt } : ajaxOpt;
        // mountOpt. primary property is 'sourceElementSelector'
        mountOpt = typeof mountOpt === 'string' ? { sourceElementSelector : mountOpt } : mountOpt;
        mountOpt = $.extend(true, {}, _mountOptDefault, mountOpt);

        // init and validate
        var tmp = mountOpt.targetContainer;
        var d = $.Deferred();
        var tContainer = lib.util.isJqObj(tmp) ? tmp : $(tmp);
        if(tContainer.length == 0) {
            d.rejectWith(null);
            return d.promise();
        }

        // ajax
        var f1 = function() {
            return lib.ajax.ajax(ajaxOpt);
        };
        // onMounting
        var f2 = function() {
            return mountOpt.onMounting ? mountOpt.onMounting.apply(tContainer[0], arguments) : null;
        };
        // mount
        var f3 = function(data, textStatus, jqXHR) {
            if (mountOpt.sourceElementSelector) {
                var e = $('<div />').html(data).find(mountOpt.sourceElementSelector);
                tContainer.html(e.length > 0 ? e[0].outerHTML : null);
            } else tContainer.html(data);
        };

        lib.flow.execPipe([f1, [f2], f3]).fail(function() {
            d.rejectWith.apply(d, $.merge([tContainer[0]], arguments));
        });

        return d.promise();
    }

    function _hasAttr(jqObj, attrName) {
        return jqObj.is('[' + attrName + ']');
    }

    function _getSetFlagAttr(element, attrName, isSet) {
        var ele = lib.util.isJqObj(element) ? element : $(element);
        if (isSet === undefined) return _hasAttr(ele, attrName);
        if (isSet) ele.attr(attrName, '');
        else ele.removeAttr(attrName);
        return !!isSet;
    }

    function _toggleFlagAttr(element, attrName) {
        var rst = _getSetFlagAttr(element, attrName);
        _getSetFlagAttr(element, attrName, !rst);
        return !rst;
    }

    function ui_selected(element, isSelected) {
        return _getSetFlagAttr(element, 'selected', isSelected);
    }

    function ui_toggleSelected(element) {
        return _toggleFlagAttr(element, 'selected');
    }

    function ui_disabled(element, isDisabled) {
        return _getSetFlagAttr(element, 'disabled', isDisabled);
    }

    function ui_toggleDisabled(element) {
        return _toggleFlagAttr(element, 'disabled');
    }

    var ui = {
        init:                ui_init,
        newline:             ui_newline,
        warn:                ui_warn,
        confirm:             ui_confirm,
        displayLoading:      ui_displayLoading,
        scrollTo:            ui_scrollTo,
        openPopup:           ui_openPopup,
        closePopup:          ui_closePopup,
        fireReturnEvent:     ui_fireReturnEvent,
        popupModal:          ui_popupModal,
        popupModalAjax:      ui_popupModalAjax,
        popupModalAir:       ui_popupModalAir,
        loadAjax:            ui_loadAjax,
        selected:            ui_selected,
        toggleSelected:      ui_toggleSelected,
        disabled:            ui_disabled,
        toggleDisabled:      ui_toggleDisabled
    };


    // publish ==================================
    lib.publish(ui, 'ui');

}(Pn, jQuery, this));
