/*  pn.l10n.js
    JS library for localization, ver 0.9
    Created by Xin Wu, 2017-09-25

    Dependency:
        jQuery 1.8+
        l10n.js
        pn.core.js
*/

/*
    l10n
        string  locale([string:locale]);  // get or set locale
        string  get(string:key); // get localized string

    More details:
        https://github.com/eligrey/l10n.js/
*/

;(function (lib, $, window, undefined) {

    // function l10n_removeL10nClass(locale, container) {
    //     if(locale) _findTargets(L10N_CLASSIBLE, container, true).removeClass(L10N_PREFIX + locale);
    // }

    // function l10n_addL10nClass(locale, container) {
    //     if(locale) _findTargets(L10N_CLASSIBLE, container, true).addClass(L10N_PREFIX + locale);
    // }

    function l10n_init() {
        // nothing right now
    }

    function l10n_locale() {
        var oldloc = String.locale.toLowerCase();
        if(typeof arguments[0] !== 'string' || !arguments[0]) {
            return oldloc;
        }
        var newloc = arguments[0].toLowerCase();
        //l10n_removeL10nClass(oldloc);
        //l10n_addL10nClass(newloc);
        String.locale = newloc;
        l10n_process();
        return newloc;
    }

    function l10n_get(key) {
        return !key ? null : key.toLocaleString();
    }

    var _handlers = {
        'l10n-attr': function(jqObj, attrValue) {
            if(!attrValue) return;
            var tmp = attrValue.split(':'); // eg: l10n-attr="src:key"
            // can not be empty or reserved attr name
            if(!tmp[0] || !tmp[1] || _handlers[tmp[0]]) return;
            jqObj.attr(tmp[0], l10n_get(tmp[1]));
        },

        'l10n-text': function(jqObj, attrValue) {
            if(attrValue) jqObj.text(l10n_get(attrValue));
        },

        'l10n-html': function(jqObj, attrValue) {
            if(attrValue) jqObj.html(l10n_get(attrValue));
        },

        'l10n-src': function(jqObj, attrValue) {
            if(attrValue) jqObj.attr('src', l10n_get(attrValue));
        },

        'l10n-href': function(jqObj, attrValue) {
            if(attrValue) jqObj.attr('href', l10n_get(attrValue));
        },

        'l10n-locale': function(jqObj, attrValue) {
            jqObj.attr('l10n-locale', l10n_locale());
        }
    };
    _handlers.__proto__ = undefined;

    function _findTargets(l10nAttrName, container, includeContainer) {
        if(!container) return $('[' + l10nAttrName + ']');
        var c = lib.util.isJqueryObject(container) ? container : $(container);
        var rst = c.find('[' + l10nAttrName + ']');
        if(!!includeContainer) {
            c.each(function(){
                var $this = $(this);
                if($this.is('[' + l10nAttrName + ']')) rst = rst.add($this);
            });
        }
        return rst;
    }

    function _populate(l10nAttrName, container, includeContainer) {
        if(!_handlers[l10nAttrName]) return;
        var targets = _findTargets(l10nAttrName, container, includeContainer);
        targets.each(function() {
            var $this = $(this);
            var l10nAttrValue = $this.attr(l10nAttrName);
            _handlers[l10nAttrName]($this, l10nAttrValue);
        }); // end each
    }

    function l10n_process(container) {
        for(var a in _handlers) {
            _populate(a, container, true);
        }
    };


    var l10n = {
        init:       l10n_init,
        locale:     l10n_locale,
        get:        l10n_get
    };


    // publish ==================================
    lib.publish(l10n, 'l10n');

}(Pn, jQuery, this));
