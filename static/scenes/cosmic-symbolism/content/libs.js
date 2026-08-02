! function(a) {
    "function" == typeof define && define.amd ? define(["jquery"], a) : "object" == typeof exports ? module.exports = a : a(jQuery)
}(function(a) {
    function b(b) {
        var g = b || window.event,
            h = i.call(arguments, 1),
            j = 0,
            l = 0,
            m = 0,
            n = 0,
            o = 0,
            p = 0;
        if (b = a.event.fix(g), b.type = "mousewheel", "detail" in g && (m = -1 * g.detail), "wheelDelta" in g && (m = g.wheelDelta), "wheelDeltaY" in g && (m = g.wheelDeltaY), "wheelDeltaX" in g && (l = -1 * g.wheelDeltaX), "axis" in g && g.axis === g.HORIZONTAL_AXIS && (l = -1 * m, m = 0), j = 0 === m ? l : m, "deltaY" in g && (m = -1 * g.deltaY, j = m), "deltaX" in g && (l = g.deltaX, 0 === m && (j = -1 * l)), 0 !== m || 0 !== l) {

            //console.log("HERE!!!!!!!!!!!!!!", g.deltaMode)
            if (1 === g.deltaMode) {
                var q = a.data(this, "mousewheel-line-height");
                j *= q, m *= q, l *= q
            } else if (2 === g.deltaMode) {
                var r = a.data(this, "mousewheel-page-height");
                j *= r, m *= r, l *= r
            }
            if (n = Math.max(Math.abs(m), Math.abs(l)), (!f || f > n) && (f = n, d(g, n) && (f /= 40)), d(g, n) && (j /= 40, l /= 40, m /= 40), j = Math[j >= 1 ? "floor" : "ceil"](j / f), l = Math[l >= 1 ? "floor" : "ceil"](l / f), m = Math[m >= 1 ? "floor" : "ceil"](m / f), k.settings.normalizeOffset && this.getBoundingClientRect) {
                var s = this.getBoundingClientRect();
                o = b.clientX - s.left, p = b.clientY - s.top
            }
            return b.deltaX = l, b.deltaY = m, b.deltaFactor = f, b.offsetX = o, b.offsetY = p, b.deltaMode = 0, h.unshift(b, j, l, m), e && clearTimeout(e), e = setTimeout(c, 200), (a.event.dispatch || a.event.handle).apply(this, h)
        }
    }

    function c() {
        f = null
    }

    function d(a, b) {
        return k.settings.adjustOldDeltas && "mousewheel" === a.type && b % 120 === 0
    }
    var e, f, g = ["wheel", "mousewheel", "DOMMouseScroll", "MozMousePixelScroll"],
        h = "onwheel" in document || document.documentMode >= 9 ? ["wheel"] : ["mousewheel", "DomMouseScroll", "MozMousePixelScroll"],
        i = Array.prototype.slice;
    if (a.event.fixHooks)
        for (var j = g.length; j;) a.event.fixHooks[g[--j]] = a.event.mouseHooks;
    var k = a.event.special.mousewheel = {
        version: "3.1.12",
        setup: function() {
            if (this.addEventListener)
                for (var c = h.length; c;) this.addEventListener(h[--c], b, !1);
            else this.onmousewheel = b;
            a.data(this, "mousewheel-line-height", k.getLineHeight(this)), a.data(this, "mousewheel-page-height", k.getPageHeight(this))
        },
        teardown: function() {
            if (this.removeEventListener)
                for (var c = h.length; c;) this.removeEventListener(h[--c], b, !1);
            else this.onmousewheel = null;
            a.removeData(this, "mousewheel-line-height"), a.removeData(this, "mousewheel-page-height")
        },
        getLineHeight: function(b) {
            var c = a(b),
                d = c["offsetParent" in a.fn ? "offsetParent" : "parent"]();
            return d.length || (d = a("body")), parseInt(d.css("fontSize"), 10) || parseInt(c.css("fontSize"), 10) || 16
        },
        getPageHeight: function(b) {
            return a(b).height()
        },
        settings: {
            adjustOldDeltas: !0,
            normalizeOffset: !0
        }
    };
    a.fn.extend({
        mousewheel: function(a) {
            return a ? this.bind("mousewheel", a) : this.trigger("mousewheel")
        },
        unmousewheel: function(a) {
            return this.unbind("mousewheel", a)
        }
    })
});
if (typeof(stlib) == "undefined") {
    var stlib = {}
}
if (!stlib.functions) {
    stlib.functions = [];
    stlib.functionCount = 0
}
stlib.global = {};
stlib.global.hash = document.location.href.split("#");
stlib.global.hash.shift();
stlib.global.hash = stlib.global.hash.join("#");
stlib.dynamicOn = true;
stlib.debugOn = false;
stlib.debug = {
    count: 0,
    messages: [],
    debug: function(b, a) {
        if (a && (typeof console) != "undefined") {
            console.log(b)
        }
        stlib.debug.messages.push(b)
    },
    show: function(a) {
        for (message in stlib.debug.messages) {
            if ((typeof console) != "undefined") {
                if (a) {
                    /ERROR/.test(stlib.debug.messages[message]) ? console.log(stlib.debug.messages[message]) : null
                } else {
                    console.log(stlib.debug.messages[message])
                }
            }
        }
    },
    showError: function() {
        stlib.debug.show(true)
    }
};
var _$d = function(a) {
    stlib.debug.debug(a, stlib.debugOn)
};
var _$d0 = function() {
    _$d(" ")
};
var _$d_ = function() {
    _$d("___________________________________________")
};
var _$d1 = function(a) {
    _$d(_$dt() + "| " + a)
};
var _$d2 = function(a) {
    _$d(_$dt() + "|  * " + a)
};
var _$de = function(a) {
    _$d(_$dt() + "ERROR: " + a)
};
var _$dt = function() {
    var b = new Date();
    var e = b.getHours();
    var a = b.getMinutes();
    var d = b.getSeconds();
    return e + ":" + a + ":" + d + " > "
};
stlib.allServices = {
    adfty: {
        title: "Adfty"
    },
    allvoices: {
        title: "Allvoices"
    },
    amazon_wishlist: {
        title: "Amazon Wishlist"
    },
    arto: {
        title: "Arto"
    },
    att: {
        title: "AT&T"
    },
    baidu: {
        title: "Baidu"
    },
    blinklist: {
        title: "Blinklist"
    },
    blip: {
        title: "Blip"
    },
    blogmarks: {
        title: "Blogmarks"
    },
    blogger: {
        title: "Blogger",
        type: "post"
    },
    buddymarks: {
        title: "BuddyMarks"
    },
    buffer: {
        title: "Buffer"
    },
    care2: {
        title: "Care2"
    },
    chiq: {
        title: "chiq"
    },
    citeulike: {
        title: "CiteULike"
    },
    chiq: {
        title: "chiq"
    },
    corkboard: {
        title: "Corkboard"
    },
    dealsplus: {
        title: "Dealspl.us"
    },
    delicious: {
        title: "Delicious"
    },
    digg: {
        title: "Digg"
    },
    diigo: {
        title: "Diigo"
    },
    dzone: {
        title: "DZone"
    },
    edmodo: {
        title: "Edmodo"
    },
    email: {
        title: "Email"
    },
    evernote: {
        title: "Evernote"
    },
    facebook: {
        title: "Facebook"
    },
    fark: {
        title: "Fark"
    },
    fashiolista: {
        title: "Fashiolista"
    },
    folkd: {
        title: "folkd.com"
    },
    foodlve: {
        title: "FoodLve"
    },
    fresqui: {
        title: "Fresqui"
    },
    friendfeed: {
        title: "FriendFeed"
    },
    funp: {
        title: "Funp"
    },
    fwisp: {
        title: "fwisp"
    },
    google: {
        title: "Google"
    },
    googleplus: {
        title: "Google +"
    },
    google_bmarks: {
        title: "Bookmarks"
    },
    google_reader: {
        title: "Google Reader"
    },
    google_translate: {
        title: "Google Translate"
    },
    hatena: {
        title: "Hatena"
    },
    instapaper: {
        title: "Instapaper"
    },
    jumptags: {
        title: "Jumptags"
    },
    kaboodle: {
        title: "Kaboodle"
    },
    linkagogo: {
        title: "linkaGoGo"
    },
    linkedin: {
        title: "LinkedIn"
    },
    livejournal: {
        title: "LiveJournal",
        type: "post"
    },
    mail_ru: {
        title: "mail.ru"
    },
    meneame: {
        title: "Meneame"
    },
    messenger: {
        title: "Messenger"
    },
    mister_wong: {
        title: "Mr Wong"
    },
    moshare: {
        title: "moShare"
    },
    myspace: {
        title: "MySpace"
    },
    n4g: {
        title: "N4G"
    },
    netlog: {
        title: "Netlog"
    },
    netvouz: {
        title: "Netvouz"
    },
    newsvine: {
        title: "Newsvine"
    },
    nujij: {
        title: "NUjij"
    },
    odnoklassniki: {
        title: "Odnoklassniki"
    },
    oknotizie: {
        title: "Oknotizie"
    },
    pinterest: {
        title: "Pinterest"
    },
    raise_your_voice: {
        title: "Raise Your Voice"
    },
    reddit: {
        title: "Reddit"
    },
    segnalo: {
        title: "Segnalo"
    },
    sharethis: {
        title: "ShareThis"
    },
    sina: {
        title: "Sina"
    },
    sonico: {
        title: "Sonico"
    },
    startaid: {
        title: "Startaid"
    },
    startlap: {
        title: "Startlap"
    },
    stumbleupon: {
        title: "StumbleUpon"
    },
    stumpedia: {
        title: "Stumpedia"
    },
    typepad: {
        title: "TypePad",
        type: "post"
    },
    tumblr: {
        title: "Tumblr"
    },
    twitter: {
        title: "Twitter"
    },
    viadeo: {
        title: "Viadeo"
    },
    virb: {
        title: "Virb"
    },
    vkontakte: {
        title: "Vkontakte"
    },
    voxopolis: {
        title: "VOXopolis"
    },
    whatsapp: {
        title: "WhatsApp"
    },
    wordpress: {
        title: "WordPress",
        type: "post"
    },
    xerpi: {
        title: "Xerpi"
    },
    xing: {
        title: "Xing"
    },
    yammer: {
        title: "Yammer"
    }
};
stlib.allOauthServices = {
    twitter: {
        title: "Twitter"
    },
    linkedIn: {
        title: "LinkedIn"
    },
    facebook: {
        title: "Facebook"
    }
};
stlib.allNativeServices = {
    fblike: {
        title: "Facebook Like"
    },
    fbrec: {
        title: "Facebook Recommend"
    },
    fbsend: {
        title: "Facebook Send"
    },
    fbsub: {
        title: "Facebook Subscribe"
    },
    foursquaresave: {
        title: "Foursquare Save"
    },
    foursquarefollow: {
        title: "Foursquare Follow"
    },
    instagram: {
        title: "Instagram Badge"
    },
    plusone: {
        title: "Google +1"
    },
    pinterestfollow: {
        title: "Pinterest Follow"
    },
    twitterfollow: {
        title: "Twitter Follow"
    },
    youtube: {
        title: "Youtube Subscribe"
    }
};
stlib.allDeprecatedServices = {
    google_bmarks: {
        title: "Google Bookmarks"
    },
    yahoo_bmarks: {
        title: "Yahoo Bookmarks"
    }
};
stlib.allOtherServices = {
    copy: {
        title: "Copy Paste"
    },
    sharenow: {
        title: "ShareNow"
    },
    sharenow_auto: {
        title: "Frictionless Sharing"
    },
    fbunlike: {
        title: "Facebook Unlike"
    }
};
var _all_services = stlib.allServices;
stlib.buttonInfo = {
    buttonList: [],
    addButton: function(a) {
        stlib.buttonInfo.buttonList.push(a)
    },
    getButton: function(a) {
        if (!isNaN(a)) {
            if (a >= stlib.buttonInfo.buttonList.length) {
                return false
            } else {
                return stlib.buttonInfo.buttonList[a]
            }
        } else {
            for (c = 0; c < stlib.buttonInfo.buttonList.length; c++) {
                if (stlib.buttonInfo.buttonList[c].service == a) {
                    debug(stlib.buttonInfo.buttonList[c])
                }
            }
        }
    },
    clickButton: function(a) {
        if (!isNaN(a)) {
            if (a >= stlib.buttonInfo.buttonList.length) {
                return false
            } else {
                if (stlib.buttonInfo.getButton(a).service == "sharethis" || stlib.buttonInfo.getButton(a).service == "email" || stlib.buttonInfo.getButton(a).service == "wordpress") {
                    stlib.buttonInfo.getButton(a).popup()
                } else {
                    stlib.buttonInfo.getButton(a).element.childNodes[0].onclick()
                }
            }
        } else {
            for (c = 0; c < stlib.buttonInfo.buttonList.length; c++) {
                if (stlib.buttonInfo.buttonList[c].service == a) {
                    if (stlib.buttonInfo.getButton(c).service == "sharethis" || stlib.buttonInfo.getButton(c).service == "email" || stlib.buttonInfo.getButton(c).service == "wordpress") {
                        stlib.buttonInfo.getButton(c).popup();
                        return true
                    } else {
                        stlib.buttonInfo.getButton(c).element.childNodes[0].onclick()
                    }
                }
            }
        }
    },
    resetButton: function() {
        stlib.buttonInfo.buttonList = []
    },
    listButton: function() {
        for (c = 0; c < stlib.buttonInfo.buttonList.length; c++) {
            debug(stlib.buttonInfo.buttonList[c])
        }
    }
};
stlib.buttonInfo.resetButton();
stlib.messageQueue = function() {
    var a = this;
    this.pumpInstance = null;
    this.queue = [];
    this.dependencies = ["data"];
    this.sending = true;
    this.setPumpInstance = function(b) {
        this.pumpInstance = b
    };
    this.send = function(f, d) {
        if ((typeof(f) == "string") && (typeof(d) == "string")) {
            _$d_();
            _$d1("Queueing message: " + d + ": " + f)
        }(typeof(f) == "string") && (typeof(d) == "string") ? this.queue.push([d, f]): null;
        if (this.sending == false || stlib.browser.ieFallback) {
            if (this.pumpInstance != null) {
                if (this.dependencies.length > 0) {
                    for (messageSet in this.queue) {
                        if (this.queue.hasOwnProperty(messageSet) && this.queue[messageSet][0] == this.dependencies[0]) {
                            if (this.queue.length > 0) {
                                _$d1("Current Queue Length: " + this.queue.length);
                                var b = this.queue.shift();
                                this.pumpInstance.broadcastSendMessage(b[1]);
                                this.dependencies.shift();
                                this.sending = true
                            }
                        }
                    }
                } else {
                    if (this.queue.length > 0) {
                        _$d1("Current Queue Length: " + this.queue.length);
                        var b = this.queue.shift();
                        this.pumpInstance.broadcastSendMessage(b[1]);
                        this.sending = true
                    }
                }
            } else {
                _$d_();
                _$d1("Pump is null")
            }
        }
        if ((stlib.browser.ieFallback) && (this.queue.length > 0)) {
            var e = "process" + stlib.functionCount;
            stlib.functionCount++;
            stlib.functions[e] = a.process;
            setTimeout("stlib.functions['" + e + "']()", 500)
        }
    };
    this.process = function() {
        _$d1("Processing MessageQueue");
        a.sending = false;
        _$d(this.queue);
        a.send()
    }
};
stlib.sharer = {
    sharerUrl: (("https:" == document.location.protocol) ? "https://ws." : "http://wd.") + "sharethis.com/api/sharer.php",
    regAuto: new RegExp(/(.*?)_auto$/),
    constructParamString: function() {
        stlib.data.validate();
        stlib.hash.checkURL();
        var a = stlib.data.pageInfo;
        var d = "?";
        var b;
        for (b in a) {
            d += b + "=" + encodeURIComponent(a[b]) + "&";
            _$d1("constructParamStringPageInfo: " + b + ": " + a[b])
        }
        a = stlib.data.shareInfo;
        for (b in a) {
            d += b + "=" + encodeURIComponent(a[b]) + "&";
            _$d1("constructParamStringShareInfo: " + b + ": " + a[b])
        }
        d += "ts=" + new Date().getTime() + "&";
        return d.substring(0, d.length - 1)
    },
    sharePinterest: function() {
        if (stlib.data.get("image", "shareInfo") == false || stlib.data.get("image", "shareInfo") == null || stlib.data.get("pinterest_native", "shareInfo") == "true") {
            if (typeof(stWidget) != "undefined" && typeof(stWidget.closeWidget) === "function") {
                stWidget.closeWidget()
            }
            if (typeof(stcloseWidget) === "function") {
                stcloseWidget()
            }
            if (typeof(stToolbar) != "undefined" && typeof(stToolbar.closeWidget) === "function") {
                stToolbar.closeWidget()
            }
            var a = document.createElement("script");
            a.setAttribute("type", "text/javascript");
            a.setAttribute("charset", "UTF-8");
            a.setAttribute("src", "//assets.pinterest.com/js/pinmarklet.js?r=" + Math.random() * 99999999);
            document.body.appendChild(a)
        }
    },
    share: function(e, a) {
        var d = stlib.sharer.constructParamString();
        _$d_();
        _$d1("Initiating a Share with the following url:");
        _$d2(stlib.sharer.sharerUrl + d);
        if ((stlib.data.get("destination", "shareInfo") == "email") || (stlib.data.get("destination", "shareInfo") == "pinterest" && stlib.data.get("source", "shareInfo").match(/share4xmobile/) == null && stlib.data.get("source", "shareInfo").match(/share4xpage/) == null && stlib.data.get("source", "shareInfo").match(/5xpage/) == null && (stlib.data.get("image", "shareInfo") == false || stlib.data.get("image", "shareInfo") == null)) || stlib.data.get("destination", "shareInfo") == "snapsets" || stlib.data.get("destination", "shareInfo") == "copy" || stlib.data.get("destination", "shareInfo") == "plusone" || stlib.data.get("destination", "shareInfo").match(stlib.sharer.regAuto) || (typeof(stlib.nativeButtons) != "undefined" && stlib.nativeButtons.checkNativeButtonSupport(stlib.data.get("destination", "shareInfo"))) || (stlib.data.get("pinterest_native", "shareInfo") != false && stlib.data.get("pinterest_native", "shareInfo") != null)) {
            var b = new Image(1, 1);
            b.src = stlib.sharer.sharerUrl + d;
            b.onload = function() {
                return
            }
        } else {
            if (typeof(a) != "undefined" && a == true) {
                window.open(stlib.sharer.sharerUrl + d, (new Date()).valueOf(), "scrollbars=1, status=1, height=480, width=640, resizable=1")
            } else {
                window.open(stlib.sharer.sharerUrl + d)
            }
        }
        e ? e() : null
    }
};
stlib.browser = {
    iemode: null,
    firefox: null,
    firefoxVersion: null,
    safari: null,
    chrome: null,
    opera: null,
    windows: null,
    mac: null,
    ieFallback: (/MSIE [6789]/).test(navigator.userAgent),
    init: function() {
        var a = navigator.userAgent.toString().toLowerCase();
        if (/msie|trident/i.test(a)) {
            if (document.documentMode) {
                stlib.browser.iemode = document.documentMode
            } else {
                stlib.browser.iemode = 5;
                if (document.compatMode) {
                    if (document.compatMode == "CSS1Compat") {
                        stlib.browser.iemode = 7
                    }
                }
            }
        }
        stlib.browser.firefox = ((a.indexOf("firefox") != -1) && (typeof InstallTrigger !== "undefined")) ? true : false;
        stlib.browser.firefoxVersion = (a.indexOf("firefox/5.0") != -1 || a.indexOf("firefox/9.0") != -1) ? false : true;
        stlib.browser.safari = (a.indexOf("safari") != -1 && a.indexOf("chrome") == -1) ? true : false;
        stlib.browser.chrome = (a.indexOf("safari") != -1 && a.indexOf("chrome") != -1) ? true : false;
        stlib.browser.opera = (window.opera || a.indexOf(" opr/") >= 0) ? true : false;
        stlib.browser.windows = (a.indexOf("windows") != -1) ? true : false;
        stlib.browser.mac = (a.indexOf("macintosh") != -1) ? true : false
    },
    getIEVersion: function() {
        return stlib.browser.iemode
    },
    isFirefox: function() {
        return stlib.browser.firefox
    },
    firefox8Version: function() {
        return stlib.browser.firefoxVersion
    },
    isSafari: function() {
        return stlib.browser.safari
    },
    isWindows: function() {
        return stlib.browser.windows
    },
    isChrome: function() {
        return stlib.browser.chrome
    },
    isOpera: function() {
        return stlib.browser.opera
    },
    isMac: function() {
        return stlib.browser.mac
    }
};
stlib.browser.init();
stlib.browser.mobile = {
    mobile: false,
    uagent: null,
    android: null,
    iOs: null,
    silk: null,
    windows: null,
    kindle: null,
    init: function() {
        this.uagent = navigator.userAgent.toLowerCase();
        if (this.isAndroid()) {
            this.mobile = true
        } else {
            if (this.isIOs()) {
                this.mobile = true
            } else {
                if (this.isSilk()) {
                    this.mobile = true
                } else {
                    if (this.isWindowsPhone()) {
                        this.mobile = true
                    } else {
                        if (this.isKindle()) {
                            this.mobile = true
                        }
                    }
                }
            }
        }
    },
    isMobile: function isMobile() {
        return this.mobile
    },
    isAndroid: function() {
        if (this.android === null) {
            this.android = this.uagent.indexOf("android") > -1
        }
        return this.android
    },
    isKindle: function() {
        if (this.kindle === null) {
            this.kindle = this.uagent.indexOf("kindle") > -1
        }
        return this.kindle
    },
    isIOs: function isIOs() {
        if (this.iOs === null) {
            this.iOs = (this.uagent.indexOf("ipad") > -1) || (this.uagent.indexOf("ipod") > -1) || (this.uagent.indexOf("iphone") > -1)
        }
        return this.iOs
    },
    isSilk: function() {
        if (this.silk === null) {
            this.silk = this.uagent.indexOf("silk") > -1
        }
        return this.silk
    },
    isWindowsPhone: function() {
        if (this.windows === null) {
            this.windows = this.uagent.indexOf("windows phone") > -1
        }
        return this.windows
    },
    handleForMobileFriendly: function handleForMobileFriendly(d, r, g) {
        if (!this.isMobile()) {
            return false
        }
        if (typeof(stLight) === "undefined") {
            stLight = {};
            stLight.publisher = r.publisher;
            stLight.sessionID = r.sessionID;
            stLight.fpc = ""
        }
        var n = (typeof(d.title) !== "undefined") ? d.title : encodeURIComponent(document.title);
        var a = (typeof(d.url) !== "undefined") ? d.url : document.URL;
        var l = (r.short_url != "" && r.short_url != null) ? r.short_url : "";
        if (r.service == "sharethis") {
            var n = (typeof(d.title) !== "undefined") ? d.title : encodeURIComponent(document.title);
            var a = (typeof(d.url) !== "undefined") ? d.url : document.URL;
            var j = "";
            if (typeof(d.summary) != "undefined" && d.summary != null) {
                j = d.summary
            }
            var b = document.createElement("form");
            b.setAttribute("method", "GET");
            b.setAttribute("action", "http://edge.sharethis.com/share4x/mobile.html");
            b.setAttribute("target", "_blank");
            var f = {
                url: a,
                title: n,
                summary: j,
                destination: r.service,
                publisher: stLight.publisher,
                fpc: stLight.fpc,
                sessionID: stLight.sessionID,
                short_url: l
            };
            if (typeof(d.image) != "undefined" && d.image != null) {
                f.image = d.image
            }
            if (typeof(d.summary) != "undefined" && d.summary != null) {
                f.desc = d.summary
            }
            if (typeof(g) != "undefined" && typeof(g.exclusive_services) != "undefined" && g.exclusive_services != null) {
                f.exclusive_services = g.exclusive_services
            }
            if (typeof(r.exclusive_services) != "undefined" && r.exclusive_services != null) {
                f.exclusive_services = r.exclusive_services
            }
            if (typeof(g) != "undefined" && typeof(g.services) != "undefined" && g.services != null) {
                f.services = g.services
            }
            if (typeof(r.services) != "undefined" && r.services != null) {
                f.services = r.services
            }
            var m = r;
            if (typeof(g) != "undefined") {
                m = g
            }
            if (typeof(m.doNotHash) != "undefined" && m.doNotHash != null) {
                f.doNotHash = m.doNotHash
            }
            if (typeof(d.via) != "undefined" && d.via != null) {
                f.via = d.via
            }
            f.service = r.service;
            f.type = r.type;
            if (stlib.data) {
                var k = stlib.json.encode(stlib.data.pageInfo);
                var i = stlib.json.encode(stlib.data.shareInfo);
                if (stlib.browser.isFirefox() && !stlib.browser.firefox8Version()) {
                    k = encodeURIComponent(encodeURIComponent(k));
                    i = encodeURIComponent(encodeURIComponent(i))
                } else {
                    k = encodeURIComponent(k);
                    i = encodeURIComponent(i)
                }
                f.pageInfo = k;
                f.shareInfo = i
            }
            for (var p in f) {
                var e = document.createElement("input");
                e.setAttribute("type", "hidden");
                e.setAttribute("name", p);
                e.setAttribute("value", f[p]);
                b.appendChild(e)
            }
            document.body.appendChild(b);
            b.submit();
            return true
        }
        if (r.service == "email") {
            var h = (l != "") ? l + "%0A%0a" : a + "%0A%0a";
            if ((typeof(d.summary) != "undefined") && d.summary != null) {
                h += d.summary + "%0A%0a"
            }
            h += "Sent using ShareThis";
            var q = "mailto:?";
            q += "Subject=" + n;
            q += "&body=" + h;
            window.location.href = q;
            return true
        }
        return false
    }
};
stlib.browser.mobile.init();
var tpcCookiesEnableCheckingDone = false;
var tpcCookiesEnabledStatus = true;
stlib.cookie = {
    setCookie: function(e, n, p) {
        var d = (navigator.userAgent.indexOf("Safari") != -1 && navigator.userAgent.indexOf("Chrome") == -1);
        var b = (navigator.userAgent.indexOf("MSIE") != -1);
        if (d || b) {
            var r = (p) ? p * 24 * 60 * 60 : 0;
            var k = document.createElement("div");
            k.setAttribute("id", e);
            k.setAttribute("type", "hidden");
            document.body.appendChild(k);
            var a = document.getElementById(e),
                f = document.createElement("form");
            try {
                var m = document.createElement('<iframe name="' + e + '" ></iframe>')
            } catch (l) {
                m = document.createElement("iframe")
            }
            m.name = e;
            m.src = "javascript:false";
            m.style.display = "none";
            a.appendChild(m);
            f.action = (("https:" == document.location.protocol) ? "https://sharethis.com/" : "http://sharethis.com/") + "account/setCookie.php";
            f.method = "POST";
            var j = document.createElement("input");
            j.setAttribute("type", "hidden");
            j.setAttribute("name", "name");
            j.setAttribute("value", e);
            f.appendChild(j);
            var q = document.createElement("input");
            q.setAttribute("type", "hidden");
            q.setAttribute("name", "value");
            q.setAttribute("value", n);
            f.appendChild(q);
            var o = document.createElement("input");
            o.setAttribute("type", "hidden");
            o.setAttribute("name", "time");
            o.setAttribute("value", r);
            f.appendChild(o);
            f.target = e;
            a.appendChild(f);
            f.submit()
        } else {
            if (p) {
                var i = new Date();
                i.setTime(i.getTime() + (p * 24 * 60 * 60 * 1000));
                var g = "; expires=" + i.toGMTString()
            } else {
                var g = ""
            }
            var h = e + "=" + escape(n) + g;
            h += "; domain=" + escape(".sharethis.com") + ";path=/";
            document.cookie = h
        }
    },
    setTempCookie: function(e, f, g) {
        if (g) {
            var d = new Date();
            d.setTime(d.getTime() + (g * 24 * 60 * 60 * 1000));
            var a = "; expires=" + d.toGMTString()
        } else {
            var a = ""
        }
        var b = e + "=" + escape(f) + a;
        b += "; domain=" + escape(".sharethis.com") + ";path=/";
        document.cookie = b
    },
    getCookie: function(b) {
        var a = document.cookie.match("(^|;) ?" + b + "=([^;]*)(;|$)");
        if (a) {
            return (unescape(a[2]))
        } else {
            return false
        }
    },
    deleteCookie: function(e) {
        var l = "/";
        var k = ".sharethis.com";
        document.cookie = e.replace(/^\s+|\s+$/g, "") + "=" + ((l) ? ";path=" + l : "") + ((k) ? ";domain=" + k : "") + ";expires=Thu, 01-Jan-1970 00:00:01 GMT";
        var d = (navigator.userAgent.indexOf("Safari") != -1 && navigator.userAgent.indexOf("Chrome") == -1);
        var b = (navigator.userAgent.indexOf("MSIE") != -1);
        if (d || b) {
            var h = document.createElement("div");
            h.setAttribute("id", e);
            h.setAttribute("type", "hidden");
            document.body.appendChild(h);
            var a = document.getElementById(e),
                f = document.createElement("form");
            try {
                var j = document.createElement('<iframe name="' + e + '" ></iframe>')
            } catch (i) {
                j = document.createElement("iframe")
            }
            j.name = e;
            j.src = "javascript:false";
            j.style.display = "none";
            a.appendChild(j);
            f.action = (("https:" == document.location.protocol) ? "https://sharethis.com/" : "http://sharethis.com/") + "account/deleteCookie.php";
            f.method = "POST";
            var g = document.createElement("input");
            g.setAttribute("type", "hidden");
            g.setAttribute("name", "name");
            g.setAttribute("value", e);
            f.appendChild(g);
            f.target = e;
            a.appendChild(f);
            f.submit()
        }
    },
    deleteAllSTCookie: function() {
        var e = document.cookie;
        e = e.split(";");
        for (var g = 0; g < e.length; g++) {
            var d = e[g];
            d = d.split("=");
            if (!/st_optout/.test(d[0])) {
                var f = d[0];
                var j = "/";
                var h = ".edge.sharethis.com";
                document.cookie = f + "=;path=" + j + ";domain=" + h + ";expires=Thu, 01-Jan-1970 00:00:01 GMT"
            }
        }
    },
    setFpcCookie: function(a, h) {
        var d = new Date;
        var j = d.getFullYear();
        var g = d.getMonth() + 9;
        var i = d.getDate();
        var e = a + "=" + escape(h);
        if (j) {
            var b = new Date(j, g, i);
            e += "; expires=" + b.toGMTString()
        }
        var f = stlib.cookie.getDomain();
        e += "; domain=" + escape(f) + ";path=/";
        document.cookie = e
    },
    getFpcCookie: function(b) {
        var a = document.cookie.match("(^|;) ?" + b + "=([^;]*)(;|$)");
        if (a) {
            return (unescape(a[2]))
        } else {
            return false
        }
    },
    getDomain: function() {
        var b = document.domain.split(/\./);
        var a = "";
        if (b.length > 1) {
            a = "." + b[b.length - 2] + "." + b[b.length - 1]
        }
        return a
    },
    checkCookiesEnabled: function() {
        if (!tpcCookiesEnableCheckingDone) {
            stlib.cookie.setTempCookie("STPC", "yes", 1);
            if (stlib.cookie.getCookie("STPC") == "yes") {
                tpcCookiesEnabledStatus = true
            } else {
                tpcCookiesEnabledStatus = false
            }
            tpcCookiesEnableCheckingDone = true;
            return tpcCookiesEnabledStatus
        } else {
            return tpcCookiesEnabledStatus
        }
    },
    hasLocalStorage: function() {
        try {
            localStorage.setItem("stStorage", "yes");
            localStorage.removeItem("stStorage");
            return true
        } catch (a) {
            return false
        }
    }
};
stlib.fpc = {
    cookieName: "__unam",
    cookieValue: "",
    createFpc: function() {
        if (!document.domain || document.domain.search(/\.gov/) > 0) {
            return false
        }
        var i = stlib.cookie.getFpcCookie(stlib.fpc.cookieName);
        if (i == false) {
            var d = Math.round(Math.random() * 2147483647);
            d = d.toString(16);
            var g = (new Date()).getTime();
            g = g.toString(16);
            var f = window.location.hostname.split(/\./)[1];
            if (!f) {
                return false
            }
            var h = "";
            h = stlib.fpc.determineHash(f) + "-" + g + "-" + d + "-1";
            i = h
        } else {
            var b = i;
            var a = b.split(/\-/);
            if (a.length == 4) {
                var e = Number(a[3]);
                e++;
                i = a[0] + "-" + a[1] + "-" + a[2] + "-" + e
            }
        }
        stlib.cookie.setFpcCookie(stlib.fpc.cookieName, i);
        stlib.fpc.cookieValue = i;
        return i
    },
    determineHash: function(b) {
        var f = 0;
        var e = 0;
        for (var d = b.length - 1; d >= 0; d--) {
            var a = parseInt(b.charCodeAt(d));
            f = ((f << 8) & 268435455) + a + (a << 12);
            if ((e = f & 161119850) != 0) {
                f = (f ^ (e >> 20))
            }
        }
        return f.toString(16)
    }
};
stlib.validate = {
    regexes: {
        notEncoded: /(%[^0-7])|(%[0-7][^0-9a-f])|["{}\[\]\<\>\\\^`\|]/gi,
        tooEncoded: /%25([0-7][0-9a-f])/gi,
        publisher: /^(([a-z]{2}(-|\.))|)[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        url: /^(http|https):\/\/([a-z0-9!'\(\)\*\.\-\+:]*(\.)[a-z0-9!'\(\)\*\.\-\+:]*)((\/[a-z0-9!'\(\)\*\.\-\+:]*)*)/i,
        fpc: /^[0-9a-f]{7}-[0-9a-f]{11}-[0-9a-f]{7,8}-[0-9]*$/i,
        sessionID: /^[0-9]*\.[0-9a-f]*$/i,
        title: /.*/,
        description: /.*/,
        buttonType: /^(chicklet|vcount|hcount|large|custom|button|)$/,
        comment: /.*/,
        destination: /.*/,
        source: /.*/,
        image: /(^(http|https):\/\/([a-z0-9!'\(\)\*\.\-\+:]*(\.)[a-z0-9!'\(\)\*\.\-\+:]*)((\/[a-z0-9!'\(\)\*\.\-\+:]*)*))|^$/i,
        sourceURL: /^(http|https):\/\/([a-z0-9!'\(\)\*\.\-\+:]*(\.)[a-z0-9!'\(\)\*\.\-\+:]*)((\/[a-z0-9!'\(\)\*\.\-\+:]*)*)/i,
        sharURL: /(^(http|https):\/\/([a-z0-9!'\(\)\*\.\-\+:]*(\.)[a-z0-9!'\(\)\*\.\-\+:]*)((\/[a-z0-9!'\(\)\*\.\-\+:]*)*))|^$/i
    }
};
stlib.html = {
    encode: function(a) {
        if (stlib.html.startsWith(a, "http")) {
            return String(a).replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        } else {
            return String(a).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        }
    },
    startsWith: function(a, b) {
        return (a.match("^" + b) == b)
    }
};
stlib.stfp = {
    screenResolutionDepthHash: "ERROR",
    pluginsListHash: "ERROR",
    fontsListHash: "ERROR",
    timezoneoffsetHash: "ERROR",
    checkIEPlugins: ["ShockwaveFlash.ShockwaveFlash", "AcroPDF.PDF", "PDF.PdfCtrl", "QuickTime.QuickTime", "rmocx.RealPlayer G2 Control", "rmocx.RealPlayer G2 Control.1", "RealPlayer.RealPlayer(tm) ActiveX Control (32-bit)", "RealVideo.RealVideo(tm) ActiveX Control (32-bit)", "RealPlayer", "SWCtl.SWCtl", "WMPlayer.OCX", "AgControl.AgControl", "Skype.Detection"],
    getPluginsHash: function() {
        var b = "";
        if (stlib.browser.getIEVersion() != null) {
            for (var a = 0; a < stlib.stfp.checkIEPlugins.length; a++) {
                try {
                    new ActiveXObject(stlib.stfp.checkIEPlugins[a]);
                    b += stlib.stfp.checkIEPlugins[a] + ":"
                } catch (d) {}
            }
        }
        if (stlib.browser.getIEVersion() == null || stlib.browser.getIEVersion() >= 11) {
            if (((typeof navigator) != "undefined" || navigator != null) && ((typeof navigator.plugins) != "undefined" || navigator.plugins != null)) {
                for (var a = 0; a < navigator.plugins.length; a++) {
                    b += navigator.plugins[a].name + ":"
                }
            }
        }
        _$d1("PluginList: " + b);
        if (b.length > 0) {
            stlib.stfp.pluginsListHash = stlib.stfp.getFpHash(b)
        }
    },
    getResolutionDepthHash: function() {
        if (screen) {
            _$d1("Resolution: " + (((typeof screen.width) != "undefined") ? screen.width : "NA") + ":" + (((typeof screen.height) != "undefined") ? screen.height : "NA") + ":" + (((typeof screen.colorDepth) != "undefined") ? screen.colorDepth : "NA"));
            stlib.stfp.screenResolutionDepthHash = stlib.stfp.getFpHash((((typeof screen.width) != "undefined") ? screen.width : "NA") + ":" + (((typeof screen.height) != "undefined") ? screen.height : "NA") + ":" + (((typeof screen.colorDepth) != "undefined") ? screen.colorDepth : "NA"))
        }
    },
    getTimezoneOffsetHash: function() {
        var b = new Date();
        var a = b.getTimezoneOffset();
        _$d1("Timezoneoffset: " + a);
        stlib.stfp.timezoneoffsetHash = stlib.stfp.getFpHash(a.toString())
    },
    getFontsHash: function() {
        var e = document;
        var a = e.createElement("iframe");
        a.id = "st_ifr";
        a.style.width = "0px";
        a.style.height = "0px";
        a.src = "about:blank";
        var b = stlib.browser.isChrome();
        var d = '<html><head><title>st_bf</title><script type="text/javascript">var stlib1={};stlib1.stfp={fontStr:"",fontsListHash:"ERROR",checkFonts:["Aharoni","algerian","Andalus","\'Angsana New\'","\'Apple Symbols\'","\'Arabic Typesetting\'","Arial","\'Baskerville Old Face\'","Batang","BatangChe","\'Bell MT\'","\'Berlin Sans FB\'","\'Bitstream Charter\'","\'Book Antiqua\'","\'Bookman Old Style\'","\'Bradley Hand ITC\'","Calibri","\'Californian FB\'","\'Cambria Math\'","\'Century Schoolbook\'","\'Century Schoolbook L\'","Charter","\'colonna mt\'","Consolas","Corbel","\'Cordia New\'","Courier","cursive","David","default","DFKai-SB","DilleniaUPC","DotumChe","Ebrima","\'Estrangelo Edessa\'","fantasy","FrankRuehl","Garamond","Gentium","Gungsuh","GungsuhChe","Haettenschweiler","\'Heiti TC\'","\'High Tower Text\'","\'Informal Roman\'","IrisUPC","\'Juice ITC\'","KaiTi","Kalinga","Kartika","Kokonor","Leelawadee","\'Liberation Mono\'","\'Liberation Sans\'","Loma","Magneto","\'Malgun Gothic\'","\'matura mt script capitals\'","\'Microsoft Himalaya\'","\'Microsoft JhengHei\'","\'Microsoft Sans Serif\'","\'Microsoft Uighur\'","\'Microsoft YaHei\'","\'Microsoft Yi Baiti\'","MingLiU","Mistral","Modena","\'Mongolian Baiti\'","\'Monotype Corsiva\'","\'MS Mincho\'","\'MS Outlook\'","\'MS PGothic\'","\'MS PMincho\'","\'MT Extra\'","\'Nimbus Mono L\'","\'Nimbus Sans L\'","NSimSun","Optima","Papyrus","PMingLiU-ExtB","Saab","\'Segoe Print\'","\'Segoe Script\'","\'Showcard Gothic\'","SimHei","\'Simplified Arabic\'","\'Simplified Arabic Fixed\'","SimSun","SimSun-ExtB","Tahoma","\'Traditional Arabic\'","Tunga","Ubuntu","\'URW Gothic L\'","\'URW Palladio L\'","Utopia","Verona","\'Viner Hand ITC\'","Vrinda","webdings","\'wide latin\'","Zapfino"],checkFontsLength:0,baseFonts:["monospace","sans-serif","serif"],baseFontsLength:0,testString:"mmmmmmmmmmlli",testSize:"72px",s:document.createElement("span"),sty:document.createElement("style"),hd:document.head||document.getElementsByTagName("head")[0],defaultWidth:{},defaultHeight:{},';
        if (b) {
            d += "checkFontForCrome:function(checkFontIndex){var detected = false;var checkElement;for(var baseFontIndex=0;baseFontIndex<stlib1.stfp.baseFontsLength;baseFontIndex++){checkElement = document.getElementById(\"st_check_fonts_\" + checkFontIndex + \"_\" + baseFontIndex);var matched = checkElement.offsetWidth!=stlib1.stfp.defaultWidth[baseFontIndex]||checkElement.offsetHeight!=stlib1.stfp.defaultHeight[baseFontIndex];detected = detected || matched;}return detected;},createFragments:function(){var span, fragment = document.createDocumentFragment();var doc = document;var d = doc.createElement('div');d.className = 'st_fontDetect';var baseFontName, checkFontName, baseElement, checkElement;for(var baseFontIndex=0;baseFontIndex<stlib1.stfp.baseFontsLength;baseFontIndex++){baseFontName = stlib1.stfp.baseFonts[baseFontIndex];baseElement = document.createElement('span');baseElement.style.fontFamily=baseFontName;baseElement.id = \"st_base_fonts_\" + baseFontIndex;baseElement.innerHTML = stlib1.stfp.testString;baseElement.style.fontSize = stlib1.stfp.testSize;fragment.appendChild(baseElement);}for(var checkFontIndex=0;checkFontIndex<stlib1.stfp.checkFontsLength;checkFontIndex++){checkFontName = stlib1.stfp.checkFonts[checkFontIndex];for(var baseFontIndex=0;baseFontIndex<stlib1.stfp.baseFontsLength;baseFontIndex++){baseFontName = stlib1.stfp.baseFonts[baseFontIndex];checkElement = document.createElement('span');checkElement.style.fontFamily= checkFontName + ',' + baseFontName;checkElement.id = \"st_check_fonts_\" + checkFontIndex + \"_\" + baseFontIndex;checkElement.innerHTML = stlib1.stfp.testString;checkElement.style.fontSize = stlib1.stfp.testSize;fragment.appendChild(checkElement);}}d.appendChild(fragment);doc.body.appendChild(d);},"
        } else {
            d += 'checkFont:function(font){var detected = false;for(var baseFontIndex=0;baseFontIndex<stlib1.stfp.baseFontsLength;baseFontIndex++){stlib1.stfp.s.style.fontFamily = font +"," + stlib1.stfp.baseFonts[baseFontIndex];var matched = stlib1.stfp.s.offsetWidth!=stlib1.stfp.defaultWidth[stlib1.stfp.baseFonts[baseFontIndex]]||stlib1.stfp.s.offsetHeight!=stlib1.stfp.defaultHeight[stlib1.stfp.baseFonts[baseFontIndex]];detected = detected || matched;}return detected;},'
        }
        d += 'createStyle:function(){var css =".st_fontDetect{display:inline !important}";stlib1.stfp.sty.type="text/css";stlib1.stfp.sty.id="st_style";if(stlib1.stfp.sty.styleSheet){stlib1.stfp.sty.styleSheet.cssText = css;}else{stlib1.stfp.sty.appendChild(document.createTextNode(css))}stlib1.stfp.hd.appendChild(stlib1.stfp.sty)},getFontsHash:function(){var isBodyStyleSet = false;stlib1.stfp.s.className="st_fontDetect";stlib1.stfp.createStyle();stlib1.stfp.s.style.fontSize=stlib1.stfp.testSize;stlib1.stfp.s.innerHTML=stlib1.stfp.testString;stlib1.stfp.baseFontsLength = stlib1.stfp.baseFonts.length;stlib1.stfp.checkFontsLength = stlib1.stfp.checkFonts.length;var bodyDisplay = null;var bodyVisibility = null;if(document.body.style.display==="none"){isBodyStyleSet = true;bodyDisplay = document.body.style.display;bodyVisibility = document.body.style.visibility;document.body.style.display="block";document.body.style.visibility="hidden";}';
        if (b) {
            d += "stlib1.stfp.createFragments();stlib1.stfp.defaultWidth[0] = document.getElementById('st_base_fonts_0').offsetWidth;stlib1.stfp.defaultHeight[0] = document.getElementById('st_base_fonts_0').offsetHeight;stlib1.stfp.defaultWidth[1] = document.getElementById('st_base_fonts_1').offsetWidth;stlib1.stfp.defaultHeight[1] = document.getElementById('st_base_fonts_1').offsetHeight;stlib1.stfp.defaultWidth[2] = document.getElementById('st_base_fonts_2').offsetWidth;stlib1.stfp.defaultHeight[2] = document.getElementById('st_base_fonts_2').offsetHeight;for(var checkFontIndex=0;checkFontIndex<stlib1.stfp.checkFontsLength;checkFontIndex++){var tempCheckFontName = stlib1.stfp.checkFonts[checkFontIndex];if(stlib1.stfp.checkFontForCrome(checkFontIndex)){stlib1.stfp.fontStr += tempCheckFontName +\":\";}}"
        } else {
            d += 'for(var baseFontIndex=0;baseFontIndex<stlib1.stfp.baseFontsLength;baseFontIndex++){var tempBaseFontName = stlib1.stfp.baseFonts[baseFontIndex];stlib1.stfp.s.style.fontFamily = tempBaseFontName;document.body.appendChild(stlib1.stfp.s);stlib1.stfp.defaultWidth[tempBaseFontName]=stlib1.stfp.s.offsetWidth;stlib1.stfp.defaultHeight[tempBaseFontName]=stlib1.stfp.s.offsetHeight;document.body.removeChild(stlib1.stfp.s)}stlib1.stfp.s.style.fontFamily="st_font";document.body.appendChild(stlib1.stfp.s);for(var checkFontIndex=0;checkFontIndex<stlib1.stfp.checkFontsLength;checkFontIndex++){var tempCheckFontName = stlib1.stfp.checkFonts[checkFontIndex];if(stlib1.stfp.checkFont(tempCheckFontName)){stlib1.stfp.fontStr += tempCheckFontName +":"}}var sheet = document.getElementById("st_style");sheet.parentNode.removeChild(sheet);document.body.removeChild(stlib1.stfp.s);'
        }
        d += 'if(isBodyStyleSet){document.body.style.display = bodyDisplay;document.body.style.visibility = bodyVisibility;}}};<\/script></head><body id="st_ifr"><div><script type="text/javascript">stlib1.stfp.getFontsHash();<\/script></div></body></html>';
        e.body.appendChild(a);
        a.contentWindow.document.open("text/html", "replace");
        a.contentWindow.document.write(d);
        a.contentWindow.document.close();
        _$d1("FontList: " + document.getElementById("st_ifr").contentWindow.stlib1.stfp.fontStr);
        stlib.stfp.fontsListHash = stlib.stfp.getFpHash(document.getElementById("st_ifr").contentWindow.stlib1.stfp.fontStr);
        e.body.removeChild(a)
    },
    init: function() {
        stlib.stfp.getFontsHash();
        stlib.stfp.getPluginsHash();
        stlib.stfp.getResolutionDepthHash();
        stlib.stfp.getTimezoneOffsetHash()
    },
    getFpHash: function(a) {
        var f = 0,
            e = 0;
        for (var d = a.length - 1; d >= 0; d--) {
            var b = parseInt(a.charCodeAt(d));
            f = ((f << 8) & 268435455) + b + (b << 12);
            if ((e = f & 161119850) != 0) {
                f = (f ^ (e >> 20))
            }
        }
        return f.toString(16)
    }
};
if (typeof(stlib.data) == "undefined") {
    stlib.data = {
        bInit: false,
        publisherKeySet: false,
        pageInfo: {},
        shareInfo: {},
        resetPageData: function() {
            stlib.data.pageInfo.fpc = "ERROR";
            stlib.data.pageInfo.sessionID = "ERROR";
            stlib.data.pageInfo.hostname = "ERROR";
            stlib.data.pageInfo.location = "ERROR"
        },
        resetShareData: function() {
            stlib.data.shareInfo = {};
            stlib.data.shareInfo.url = "ERROR";
            stlib.data.shareInfo.sharURL = "";
            stlib.data.shareInfo.buttonType = "ERROR";
            stlib.data.shareInfo.destination = "ERROR";
            stlib.data.shareInfo.source = "ERROR"
        },
        resetData: function() {
            stlib.data.resetPageData();
            stlib.data.resetShareData()
        },
        validate: function() {
            var a = stlib.validate.regexes;

            function b(f, h) {
                if (h != encodeURIComponent(h)) {
                    a.notEncoded.test(h) ? _$de(f + " not encoded") : null;
                    a.tooEncoded.test(h) ? _$de(f + " has too much encoding") : null
                }
                var g = a[f] ? a[f].test(decodeURIComponent(h)) : true;
                if (!g) {
                    _$de(f + " failed validation")
                }
            }
            var d = stlib.data.pageInfo;
            var e;
            for (e in d) {
                b(e, d[e])
            }
            d = stlib.data.shareInfo;
            for (e in d) {
                b(e, d[e])
            }
        },
        init: function() {
            if (!stlib.data.bInit) {
                stlib.data.bInit = true;
                stlib.data.resetData();
                stlib.data.set("url", document.location.href, "shareInfo");
                var g = "";
                stlib.hash.init();
                stlib.data.set("shareHash", stlib.hash.shareHash, "pageInfo");
                stlib.data.set("incomingHash", stlib.hash.incomingHash, "pageInfo");
                if (!stlib.hash.doNotHash) {
                    g = "#" + stlib.data.get("shareHash", "pageInfo")
                }
                var f = stlib.hash.updateParams();
                stlib.data.set("url", f + g, "shareInfo");
                if (stlib.data.publisherKeySet != true) {
                    stlib.data.set("publisher", "ur.00000000-0000-0000-0000-000000000000", "pageInfo")
                }
                stlib.fpc.createFpc();
                stlib.data.set("fpc", stlib.fpc.cookieValue, "pageInfo");
                var b = (new Date()).getTime().toString();
                var h = Number(Math.random().toPrecision(5).toString().substr(2)).toString();
                stlib.data.set("sessionID", b + "." + h, "pageInfo");
                stlib.data.set("hostname", document.location.hostname, "pageInfo");
                stlib.data.set("location", document.location.pathname, "pageInfo");
                var e = document.referrer;
                var i = e.replace("http://", "").replace("https://", "").split("/");
                var d = i.shift();
                var a = i.join("/");
                stlib.data.set("refDomain", d, "pageInfo");
                stlib.data.set("refQuery", a, "pageInfo")
            }
        },
        setPublisher: function(a) {
            stlib.data.set("publisher", a, "pageInfo");
            stlib.data.publisherKeySet = true
        },
        setSource: function(d, a) {
            var b = "";
            if (a) {
                if (a.toolbar) {
                    b = "toolbar" + d
                } else {
                    if (a.page && a.page != "home" && a.page != "") {
                        b = "chicklet" + d
                    } else {
                        b = "button" + d
                    }
                }
            } else {
                b = d
            }
            stlib.data.set("source", b, "shareInfo")
        },
        set: function(a, d, b) {
            _$d_();
            _$d1("Setting: " + a + ": " + d);
            if (typeof(d) == "number" || typeof(d) == "boolean") {
                stlib.data[b][a] = d
            } else {
                if (typeof(d) == "undefined" || d == null) {
                    _$d1("Value undefined or null")
                } else {
                    stlib.data[b][a] = encodeURIComponent(decodeURIComponent(unescape(d.replace(/<[^<>]*>/gi, " ")).replace(/%/gi, "%25")));
                    if (a == "url" || a == "location" || a == "image") {
                        try {
                            stlib.data[b][a] = encodeURIComponent(decodeURIComponent(decodeURI(d.replace(/<[^<>]*>/gi, " ")).replace(/%/gi, "%25")))
                        } catch (f) {
                            stlib.data[b][a] = encodeURIComponent(decodeURIComponent(unescape(d.replace(/<[^<>]*>/gi, " ")).replace(/%/gi, "%25")))
                        }
                    }
                }
            }
        },
        get: function(a, b) {
            if (stlib.data[b] && stlib.data[b][a]) {
                return decodeURIComponent(stlib.data[b][a])
            } else {
                return false
            }
        },
        unset: function(a, b) {
            if (stlib.data[b] && typeof(stlib.data[b][a]) != "undefined") {
                delete stlib.data[b][a]
            }
        }
    };
    stlib.data.resetData()
}
stlib.hash = {
    doNotHash: true,
    hashAddressBar: false,
    doNotCopy: true,
    prefix: "sthash",
    shareHash: "",
    incomingHash: "",
    validChars: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"],
    servicePreferences: {
        linkedin: "param",
        stumbleupon: "param",
        bebo: "param"
    },
    hashDestination: function(b) {
        if (b == "copy") {
            return "dpuf"
        }
        var d = b.substring(0, 2) + b.substring(b.length - 2, b.length);
        var a = function(e, f) {
            if (e.charCodeAt(f) == 122) {
                return "a"
            }
            return String.fromCharCode(e.charCodeAt(f) + 1)
        };
        return a(d, 0) + a(d, 1) + a(d, 2) + a(d, 3)
    },
    getHash: function() {
        var d = false;
        var b = "";
        var e = document.location.href;
        e = e.split("#").shift();
        var a = e.split("?");
        if (a.length > 1) {
            a = a[1].split("&");
            for (arg in a) {
                try {
                    if (a[arg].substring(0, 6) == "sthash") {
                        d = true;
                        b = a[arg]
                    }
                } catch (f) {}
            }
            if (d) {
                return b
            } else {
                return document.location.hash.substring(1)
            }
        } else {
            return document.location.hash.substring(1)
        }
    },
    stripHash: function(a) {
        var b = a;
        b = b.split("#");
        if (b.length > 1) {
            return b[1]
        } else {
            return ""
        }
    },
    clearHash: function() {
        if (stlib.hash.validateHash(document.location.hash)) {
            var a = document.location.href.split("#").shift();
            if (window.history && history.replaceState) {
                history.replaceState(null, document.title, a)
            } else {
                if ((/MSIE/).test(navigator.userAgent)) {
                    window.location.replace("#")
                } else {
                    document.location.hash = ""
                }
            }
        }
    },
    init: function() {
        var b = "";
        var a = stlib.hash.validChars.length;
        for (var f = 0; f < 8; f++) {
            b += stlib.hash.validChars[Math.random() * a | 0]
        }
        if (stlib.hash.getHash() == "") {
            stlib.hash.shareHash = stlib.hash.prefix + "." + b
        } else {
            var d = stlib.hash.getHash().split(".");
            var e = d.shift();
            if (e == stlib.hash.prefix || e == stlib.hash.prefix) {
                stlib.hash.incomingHash = stlib.hash.getHash();
                stlib.hash.shareHash = stlib.hash.prefix + "." + d.shift() + "." + b
            } else {
                stlib.hash.shareHash = stlib.hash.prefix + "." + b
            }
        }
        if (!stlib.hash.doNotHash && stlib.hash.hashAddressBar) {
            if (document.location.hash == "" || stlib.hash.validateHash(document.location.hash)) {
                if (window.history && history.replaceState) {
                    history.replaceState(null, "ShareThis", "#" + stlib.hash.shareHash + ".dpbs")
                } else {
                    if ((/MSIE/).test(navigator.userAgent)) {
                        window.location.replace("#" + stlib.hash.shareHash + ".dpbs")
                    } else {
                        document.location.hash = stlib.hash.shareHash + ".dpbs"
                    }
                }
            }
        } else {
            stlib.hash.clearHash()
        }
        if (!stlib.hash.doNotHash && !stlib.hash.doNotCopy) {
            stlib.hash.copyPasteInit()
        }
        stlib.hash.copyPasteLog()
    },
    checkURL: function() {
        var b = stlib.data.get("destination", "shareInfo");
        var g = stlib.hash.updateParams(b);
        var e = "." + stlib.hash.hashDestination(b);
        stlib.hash.updateDestination(e);
        if (!stlib.hash.doNotHash && typeof(stlib.data.pageInfo.shareHash) != "undefined") {
            var d = stlib.data.get("url", "shareInfo");
            var h = stlib.hash.stripHash(d);
            if (stlib.hash.validateHash(h) || h == "") {
                if (typeof(stlib.hash.servicePreferences[b]) != "undefined") {
                    if (stlib.hash.servicePreferences[b] == "param") {
                        _$d1("Don't use hash, use params");
                        _$d2(g);
                        if (g.split("?").length > 1) {
                            var f = g.split("?")[1].split("&");
                            var i = false;
                            for (var a = 0; a < f.length; a++) {
                                if (f[a].split(".")[0] == "sthash") {
                                    i = true
                                }
                            }
                            if (i) {
                                stlib.data.set("url", g, "shareInfo")
                            } else {
                                stlib.data.set("url", g + "&" + stlib.data.pageInfo.shareHash, "shareInfo")
                            }
                        } else {
                            stlib.data.set("url", g + "?" + stlib.data.pageInfo.shareHash, "shareInfo")
                        }
                        if (b == "linkedin") {
                            if (stlib.data.get("sharURL", "shareInfo") != "") {
                                stlib.data.set("sharURL", stlib.data.get("url", "shareInfo"), "shareInfo")
                            }
                        }
                    } else {
                        _$d1("Using Hash");
                        stlib.data.set("url", g + "#" + stlib.data.pageInfo.shareHash, "shareInfo")
                    }
                } else {
                    _$d1("Not using custom destination hash type");
                    stlib.data.set("url", g + "#" + stlib.data.pageInfo.shareHash, "shareInfo")
                }
            }
        }
    },
    updateParams: function(a) {
        var g = stlib.data.get("url", "shareInfo").split("#").shift();
        var f = /(\?)sthash\.[a-zA-z0-9]{8}\.[a-zA-z0-9]{8}/;
        var e = /(&)sthash\.[a-zA-z0-9]{8}\.[a-zA-z0-9]{8}/;
        var d = /(\?)sthash\.[a-zA-z0-9]{8}/;
        var b = /(&)sthash\.[a-zA-z0-9]{8}/;
        if (f.test(g)) {
            g = g.replace(f, "?" + stlib.data.pageInfo.shareHash)
        } else {
            if (e.test(g)) {
                g = g.replace(e, "&" + stlib.data.pageInfo.shareHash)
            } else {
                if (d.test(g)) {
                    g = g.replace(d, "?" + stlib.data.pageInfo.shareHash)
                } else {
                    if (b.test(g)) {
                        g = g.replace(b, "&" + stlib.data.pageInfo.shareHash)
                    }
                }
            }
        }
        return g
    },
    updateDestination: function(b) {
        var a = /sthash\.[a-zA-z0-9]{8}\.[a-zA-z0-9]{8}\.[a-z]{4}/;
        var d = /sthash\.[a-zA-z0-9]{8}\.[a-z]{4}/;
        _$d_();
        _$d1("Updating Destination");
        if (a.test(stlib.data.pageInfo.shareHash)) {
            _$d2(stlib.data.pageInfo.shareHash.substring(0, 24));
            stlib.data.pageInfo.shareHash = stlib.data.pageInfo.shareHash.substring(0, 24) + b
        } else {
            if (d.test(stlib.data.pageInfo.shareHash)) {
                _$d2(stlib.data.pageInfo.shareHash.substring(0, 15));
                stlib.data.pageInfo.shareHash = stlib.data.pageInfo.shareHash.substring(0, 15) + b
            } else {
                stlib.data.pageInfo.shareHash += b
            }
        }
    },
    validateHash: function(a) {
        var b = /[\?#&]?sthash\.[a-zA-z0-9]{8}\.[a-zA-z0-9]{8}$/;
        var d = /[\?#&]?sthash\.[a-zA-z0-9]{8}\.[a-zA-z0-9]{8}\.[a-z]{4}$/;
        var e = /[\?#&]?sthash\.[a-zA-z0-9]{8}\.[a-z]{4}$/;
        var f = /[\?#&]?sthash\.[a-zA-z0-9]{8}$/;
        return f.test(a) || e.test(a) || d.test(a) || b.test(a)
    },
    appendHash: function(a) {
        var b = stlib.hash.stripHash(a);
        if (stlib.data.pageInfo.shareHash && (stlib.hash.validateHash(b) || b == "")) {
            a = a.replace("#" + b, "") + "#" + stlib.data.pageInfo.shareHash
        } else {}
        return a
    },
    copyPasteInit: function() {
        var a = document.getElementsByTagName("body")[0];
        var d = document.createElement("div");
        d.id = "stcpDiv";
        d.style.position = "absolute";
        d.style.top = "-1999px";
        d.style.left = "-1988px";
        a.appendChild(d);
        d.innerHTML = "ShareThis Copy and Paste";
        var b = document.location.href.split("#").shift();
        var e = "#" + stlib.hash.shareHash;
        if (document.addEventListener) {
            a.addEventListener("copy", function(i) {
                if (typeof(Tynt) != "undefined") {
                    return
                }
                var h = document.getSelection();
                if (h.isCollapsed) {
                    return
                }
                var g = h.getRangeAt(0).cloneContents();
                d.innerHTML = "";
                d.appendChild(g);
                if (d.textContent.trim().length == 0) {
                    return
                }
                if ((h + "").trim().length == 0) {} else {
                    if (d.innerHTML == (h + "") || d.textContent == (h + "")) {
                        d.innerHTML = stlib.html.encode(stlib.hash.selectionModify(h))
                    } else {
                        d.innerHTML += stlib.html.encode(stlib.hash.selectionModify(h, true))
                    }
                }
                var f = document.createRange();
                f.selectNodeContents(d);
                var j = h.getRangeAt(0);
                h.removeAllRanges();
                h.addRange(f);
                setTimeout(function() {
                    h.removeAllRanges();
                    h.addRange(j)
                }, 0)
            }, false)
        } else {
            if (document.attachEvent) {}
        }
    },
    copyPasteLog: function() {
        var d = window.addEventListener ? "addEventListener" : "attachEvent";
        var b = d == "attachEvent" ? "oncopy" : "copy";
        var a = document.getElementsByTagName("body")[0];
        a[d](b, function(g) {
            var f = true;
            stlib.data.resetShareData();
            stlib.data.set("url", document.location.href, "shareInfo");
            stlib.data.setSource("copy");
            stlib.data.set("destination", "copy", "shareInfo");
            stlib.data.set("buttonType", "custom", "shareInfo");
            if (typeof(Tynt) != "undefined") {
                stlib.data.set("result", "tynt", "shareInfo");
                stlib.logger.log("debug");
                f = false
            }
            if (typeof(addthis_config) != "undefined") {
                stlib.data.set("result", "addThis", "shareInfo");
                if (typeof(addthis_config.data_track_textcopy) == "undefined" || addthis_config.data_track_textcopy) {
                    stlib.data.set("enabled", "true", "shareInfo");
                    f = false
                } else {
                    stlib.data.set("enabled", "false", "shareInfo")
                }
                stlib.logger.log("debug")
            }
            if (f) {
                stlib.data.set("result", "pass", "shareInfo");
                stlib.logger.log("debug")
            }
        }, false)
    },
    logCopy: function(a, b) {
        stlib.data.resetShareData();
        stlib.data.set("url", a, "shareInfo");
        stlib.data.setSource("copy");
        stlib.data.set("destination", "copy", "shareInfo");
        stlib.data.set("buttonType", "custom", "shareInfo");
        if (b) {
            stlib.data.set("description", b, "shareInfo")
        }
        stlib.sharer.share()
    },
    selectionModify: function(o, m) {
        o = "" + o;
        _$d_();
        _$d1("Copy Paste");
        var n = /^((http|https):\/\/([a-z0-9!'\(\)\*\.\-\+:]*(\.)[a-z0-9!'\(\)\*\.\-\+:]*)((\/[a-z0-9!'\(\)\*\.\-\+:]*)*))/i;
        var h = /^([a-z0-9!'\(\)\*\.\-\+:]*(\.)[a-z0-9!'\(\)\*\.\-\+:]*)((\/[a-z0-9!'\(\)\*\.\-\+:]*)*)/i;
        var f = /^\+?1?[\.\-\\)_\s]?[\\(]?[0-9]{3}[\.\-\\)_\s]?[0-9]{3}[\.\-_\s]?[0-9]{4}$|^[0-9]{3}[\.\-_\s]?[0-9]{4}$/;
        var j = /^[0-9]{3}[\.\-_\s]?[0-9]{8}$/;
        var l = /^[0-9]{2}[\.\-_\s]?[0-9]{4}[\.\-_\s]?[0-9]{4}$/;
        var d = /[\-_\.a-z0-9]+@[\-_\.a-z0-9]+\.[\-_\.a-z0-9]+/i;
        var g = /[\s@]/;
        var b = document.location.href.split("#").shift();
        var i = "#" + stlib.hash.shareHash;
        var a = "";
        var k = "";
        var e = "";
        if (typeof(m) == "undefined" && ((n.test(o) || h.test(o)) && !g.test(o.trim()))) {
            _$d2("is Url");
            if (o.match(/#/) == null || stlib.hash.validateHash(o)) {
                k = o.split("#")[0] + i + ".dpuf";
                e = k
            } else {
                k = o;
                e = k
            }
        } else {
            _$d2("is Not Url");
            if (document.location.hash == "" || (/^#$/).test(document.location.hash) || stlib.hash.validateHash(document.location.hash)) {
                k = b + i + ".dpuf"
            } else {
                k = document.location.href
            }
            e = o;
            if (o.length > 50) {
                a = " - See more at: " + k + "";
                if (!f.test(o) && !j.test(o) && !l.test(o) && !d.test(o)) {
                    e += a
                }
            }
        }
        if (o.length > 140) {
            o = o.substring(0, 137) + "..."
        }
        stlib.hash.logCopy(k, o);
        return ((m && m == true) ? a : e)
    }
};
stlib.pump = function(a, d, e) {
    var b = this;
    this.isIframeReady = false;
    this.isIframeSending = false;
    this.getHash = function(f) {
        var g = f.split("#");
        g.shift();
        return g.join("#")
    };
    this.broadcastInit = function(f) {
        this.destination = f;
        _$d_("---------------------");
        _$d1("Initiating broadcaster:");
        _$d(this.destination)
    };
    this.broadcastSendMessage = function(f) {
        _$d_("---------------------");
        _$d1("Initiating Send:");
        if (this.destination === window) {
            if (stlib.browser.ieFallback) {
                window.location.replace(window.location.href.split("#")[0] + "#" + f);
                _$d2("child can't communicate with parent");
                return
            }
            _$d2("Iframe to publisher: " + f);
            parent.postMessage("#" + f, document.referrer)
        } else {
            _$d2("Publisher to Iframe: " + f);
            if (stlib.browser.ieFallback) {
                if (this.destination.contentWindow) {
                    this.destination.contentWindow.location.replace(this.destination.src + "#" + f);
                    this.isIframeSending = true
                }
                return
            }
            this.destination.contentWindow.postMessage("#" + f, this.destination.src)
        }
    };
    this.receiverInit = function(h, k) {
        _$d_("---------------------");
        _$d1("Initiating Receiver:");
        _$d(h);
        if (stlib.browser.ieFallback) {
            this.callback = k;
            this.source = h;
            if (h === window) {
                window.location.replace(window.location.href.split("#")[0] + "#");
                this.currentIframe = window.location.hash;
                var g = "receiver" + stlib.functionCount;
                stlib.functions[g] = function(m) {
                    if ("" != window.location.hash && "#" != window.location.hash) {
                        var l = window.location.hash;
                        m(l);
                        window.location.replace(window.location.href.split("#")[0] + "#")
                    }
                };
                stlib.functionCount++;
                var j = "callback" + stlib.functionCount;
                stlib.functions[j] = k;
                stlib.functionCount++;
                setInterval("stlib.functions['" + g + "'](stlib.functions['" + j + "'])", 200)
            } else {}
            var i = window.addEventListener ? "addEventListener" : "attachEvent";
            var f = i == "attachEvent" ? "onmessage" : "message";
            window[i](f, function(l) {
                if (h == window) {} else {
                    if (l.origin.indexOf("sharethis.com") != -1) {
                        if (l.data.match(/#Pinterest Click/)) {
                            stlib.sharer.sharePinterest()
                        }
                    }
                }
            }, false);
            return
        }
        var i = window.addEventListener ? "addEventListener" : "attachEvent";
        var f = i == "attachEvent" ? "onmessage" : "message";
        window[i](f, function(l) {
            if (h == window) {
                _$d1("arrived in iframe from:");
                _$d(l.origin);
                if (l.data.match(/#fragmentPump/) || l.data.match(/#Buttons Ready/) || l.data.match(/#Widget Ready/) || l.data.indexOf("#light") == 0 || l.data.indexOf("#widget") == 0 || l.data.indexOf("#popup") == 0 || l.data.indexOf("#show") == 0 || l.data.indexOf("#init") == 0 || l.data.indexOf("#test") == 0 || l.data.indexOf("#data") == 0) {
                    k(l.data)
                }
            } else {
                if (l.origin.indexOf("sharethis.com") != -1) {
                    _$d1("arrived in parent from:");
                    _$d(l.origin);
                    if (l.data.match(/#fragmentPump/) || l.data.match(/#Buttons Ready/) || l.data.match(/#Widget Ready/) || l.data.indexOf("#light") == 0 || l.data.indexOf("#widget") == 0 || l.data.indexOf("#popup") == 0 || l.data.indexOf("#show") == 0 || l.data.indexOf("#init") == 0 || l.data.indexOf("#test") == 0 || l.data.indexOf("#data") == 0) {
                        k(l.data)
                    } else {
                        if (l.data.match(/#Pinterest Click/)) {
                            stlib.sharer.sharePinterest()
                        }
                    }
                } else {
                    _$d1("discarded event from:");
                    _$d(l.origin)
                }
            }
        }, false)
    };
    this.broadcastInit(a);
    this.receiverInit(d, e)
};
stlib.json = {
    c: {
        "\b": "b",
        "\t": "t",
        "\n": "n",
        "\f": "f",
        "\r": "r",
        '"': '"',
        "\\": "\\",
        "/": "/"
    },
    d: function(a) {
        return a < 10 ? "0".concat(a) : a
    },
    e: function(c, f, e) {
        e = eval;
        delete eval;
        if (typeof eval === "undefined") {
            eval = e
        }
        f = eval("" + c);
        eval = e;
        return f
    },
    i: function(d, b, a) {
        return 1 * d.substr(b, a)
    },
    p: ["", "000", "00", "0", ""],
    rc: null,
    rd: /^[0-9]{4}\-[0-9]{2}\-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}$/,
    rs: /(\x5c|\x2F|\x22|[\x0c-\x0d]|[\x08-\x0a])/g,
    rt: /^([0-9]+|[0-9]+[,\.][0-9]{1,3})$/,
    ru: /([\x00-\x07]|\x0b|[\x0e-\x1f])/g,
    s: function(a, b) {
        return "\\".concat(stlib.json.c[b])
    },
    u: function(a, b) {
        var e = b.charCodeAt(0).toString(16);
        return "\\u".concat(stlib.json.p[e.length], e)
    },
    v: function(b, a) {
        return stlib.json.types[typeof result](result) !== Function && (a.hasOwnProperty ? a.hasOwnProperty(b) : a.constructor.prototype[b] !== a[b])
    },
    types: {
        "boolean": function() {
            return Boolean
        },
        "function": function() {
            return Function
        },
        number: function() {
            return Number
        },
        object: function(a) {
            return a instanceof a.constructor ? a.constructor : null
        },
        string: function() {
            return String
        },
        "undefined": function() {
            return null
        }
    },
    $$: function(a) {
        function b(f, d) {
            d = f[a];
            delete f[a];
            try {
                stlib.json.e(f)
            } catch (e) {
                f[a] = d;
                return 1
            }
        }
        return b(Array) && b(Object)
    },
    encode: function() {
        var d = arguments.length ? arguments[0] : this,
            a, h;
        if (d === null) {
            a = "null"
        } else {
            if (d !== undefined && (h = stlib.json.types[typeof d](d))) {
                switch (h) {
                    case Array:
                        a = [];
                        for (var g = 0, e = 0, b = d.length; e < b; e++) {
                            if (d[e] !== undefined && (h = stlib.json.encode(d[e]))) {
                                a[g++] = h
                            }
                        }
                        a = "[".concat(a.join(","), "]");
                        break;
                    case Boolean:
                        a = String(d);
                        break;
                    case Date:
                        a = '"'.concat(d.getFullYear(), "-", stlib.json.d(d.getMonth() + 1), "-", stlib.json.d(d.getDate()), "T", stlib.json.d(d.getHours()), ":", stlib.json.d(d.getMinutes()), ":", stlib.json.d(d.getSeconds()), '"');
                        break;
                    case Function:
                        break;
                    case Number:
                        a = isFinite(d) ? String(d) : "null";
                        break;
                    case String:
                        a = '"'.concat(d.replace(stlib.json.rs, stlib.json.s).replace(stlib.json.ru, stlib.json.u), '"');
                        break;
                    default:
                        var g = 0,
                            f;
                        a = [];
                        for (f in d) {
                            if (d[f] !== undefined && (h = stlib.json.encode(d[f]))) {
                                a[g++] = '"'.concat(f.replace(stlib.json.rs, stlib.json.s).replace(stlib.json.ru, stlib.json.u), '":', h)
                            }
                        }
                        a = "{".concat(a.join(","), "}");
                        break
                }
            }
        }
        return a
    },
    decode: function(a) {
        if (typeof(a) == "string") {
            var d = null;
            try {
                if (/^[\],:{}\s]*$/.test(a.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) {
                    d = window.JSON && window.JSON.parse ? window.JSON.parse(a) : (new Function("return " + a))();
                    return d
                } else {
                    return null
                }
            } catch (b) {}
        }
    }
};
try {
    stlib.json.rc = new RegExp('^("(\\\\.|[^"\\\\\\n\\r])*?"|[,:{}\\[\\]0-9.\\-+Eaeflnr-u \\n\\r\\t])+?$')
} catch (z) {
    stlib.json.rc = /^(true|false|null|\[.*\]|\{.*\}|".*"|\d+|\d+\.\d+)$/
}
stlib.logger = {
    loggerUrl: (("https:" == document.location.protocol) ? "https://" : "http://") + "l.sharethis.com/",
    productArray: new Array(),
    version: "",
    lang: "en",
    isFpEvent: false,
    constructParamString: function() {
        var a = stlib.data.pageInfo;
        var d = "";
        var b;
        for (b in a) {
            if (!stlib.logger.isFpEvent && (b == "ufa" || b == "ufb" || b == "ufc" || b == "ufd")) {
                continue
            }
            d += b + "=" + a[b] + "&"
        }
        a = stlib.data.shareInfo;
        for (b in a) {
            d += b + "=" + a[b] + "&"
        }
        return d.substring(0, d.length - 1)
    },
    log: function(e, g) {
        _$d_();
        _$d1("Log Event PageInfo:");
        _$d(stlib.data.pageInfo);
        _$d1("Log Event ShareInfo:");
        _$d(stlib.data.shareInfo);
        if (typeof(e) == "undefined") {
            _$de("event does not exist \nFor help, contact support@sharethis.com");
            return
        }
        if (stlib.data.pageInfo == null || stlib.data.shareInfo == null) {
            _$de("stlib.logger does not have enough info to log \nFor help, contact support@sharethis.com");
            return
        }
        if (!stlib.data.get("url", "shareInfo")) {
            _$de("shareThisInfo.url do not exist \nFor help, contact support@sharethis.com");
            return
        }
        if (!stlib.data.get("sessionID", "pageInfo")) {
            _$de("sharePageInfo.sessionID do not exist \nFor help, contact support@sharethis.com");
            return
        }
        if (!stlib.data.get("destination", "shareInfo")) {
            if (e != "pview") {
                _$de("shareThisInfo.destination do not exist \nFor help, contact support@sharethis.com");
                return
            }
        }
        if (!stlib.data.get("buttonType", "shareInfo")) {
            if (e != "pview") {
                _$de("shareThisInfo.type do not exist \nFor help, contact support@sharethis.com");
                return
            }
        }
        if (!stlib.data.get("source", "shareInfo")) {
            _$de("shareThisInfo.source do not exist \nFor help, contact support@sharethis.com");
            return
        }
        if (e == "pview") {
            stlib.data.unset("destination", "shareInfo");
            stlib.data.unset("buttonType", "shareInfo")
        } else {
            stlib.data.unset("refDomain", "pageInfo");
            stlib.data.unset("refQuery", "pageInfo")
        }
        if (e == "pview" || e == "share") {
            stlib.logger.isFpEvent = true;
            if (stlib.stfp.screenResolutionDepthHash != "ERROR") {
                stlib.data.set("ufa", stlib.stfp.screenResolutionDepthHash, "pageInfo")
            }
            if (stlib.stfp.pluginsListHash != "ERROR") {
                stlib.data.set("ufb", stlib.stfp.pluginsListHash, "pageInfo")
            }
            if (stlib.stfp.fontsListHash != "ERROR") {
                stlib.data.set("ufc", stlib.stfp.fontsListHash, "pageInfo")
            }
            if (stlib.stfp.timezoneoffsetHash != "ERROR") {
                stlib.data.set("ufd", stlib.stfp.timezoneoffsetHash, "pageInfo")
            }
        } else {
            stlib.logger.isFpEvent = false
        }
        if (typeof(stlib.data.get("counter", "shareInfo")) != "undefined") {
            var d = 0;
            if (stlib.data.get("counter", "shareInfo")) {
                d = stlib.data.get("counter", "shareInfo")
            }
            stlib.data.set("ts" + new Date().getTime() + "." + d, "", "shareInfo");
            stlib.data.unset("counter", "shareInfo")
        } else {
            stlib.data.set("ts" + new Date().getTime(), "", "shareInfo")
        }
        var a = (e == "pview") ? "pview" : ((e == "debug") ? "cns" : "log");
        if (e == "pview") {
            var f = stlib.logger.loggerUrl + a + "?event=" + e + "&product=" + stlib.logger.productArray + "&version=" + stlib.logger.version + "&lang=" + stlib.logger.lang + "&" + stlib.logger.constructParamString()
        } else {
            var f = stlib.logger.loggerUrl + a + "?event=" + e + "&" + stlib.logger.constructParamString()
        }
        _$d1("Final Log Url:");
        _$d2(f);
        var b = new Image(1, 1);
        b.src = f;
        b.onload = function() {
            return
        };
        g ? g() : null
    }
};
stlib.scriptLoader = {
    loadJavascript: function(b, d) {
        _$d_();
        _$d1("Loading JS: " + b);
        var a = stlib.scriptLoader;
        a.head = document.getElementsByTagName("head")[0];
        a.scriptSrc = b;
        a.script = document.createElement("script");
        a.script.setAttribute("type", "text/javascript");
        a.script.setAttribute("src", a.scriptSrc);
        a.script.async = true;
        a.script.onload = d;
        a.script.onreadystatechange = function() {
            if (this.readyState == "loaded") {
                d()
            }
        };
        a.s = document.getElementsByTagName("script")[0];
        a.s.parentNode.insertBefore(a.script, a.s)
    },
    loadCSS: function(b, e) {
        _$d_();
        _$d1("Loading CSS: " + b);
        var a = stlib.scriptLoader;
        var d;
        a.head = document.getElementsByTagName("head")[0];
        a.cssSrc = b;
        a.css = document.createElement("link");
        a.css.setAttribute("rel", "stylesheet");
        a.css.setAttribute("type", "text/css");
        a.css.setAttribute("href", b);
        a.css.setAttribute("id", b);
        setTimeout(function() {
            e();
            if (!document.getElementById(b)) {
                d = setInterval(function() {
                    if (document.getElementById(b)) {
                        clearInterval(d);
                        e()
                    }
                }, 100)
            }
        }, 100);
        a.head.appendChild(a.css)
    }
};
stlib.nativeButtons = {
    supportedNativeButtons: {
        linkedinfollow: {
            log: true,
            config: true,
            dependencyLoaded: false,
            dependencyLoading: false,
            requiredFields: [
                ["st_followId", "Profile Id", "Enter '207839' for profile id"]
            ]
        },
        twitterfollow: {
            log: false,
            config: true,
            requiredFields: [
                ["st_username", "Username", "Enter 'sharethis' for username"]
            ]
        },
        pinterestfollow: {
            log: true,
            config: true,
            requiredFields: [
                ["st_username", "Username", "Enter 'sharethis' for username"]
            ]
        },
        youtube: {
            log: true,
            config: true,
            requiredFields: [
                ["st_username", "Username", "Enter 'sharethis' for username"]
            ]
        },
        foursquaresave: {
            log: false,
            config: true,
            dependencyLoaded: false,
            dependencyLoading: false
        },
        foursquarefollow: {
            log: false,
            config: true,
            requiredFields: [
                ["st_username", "Username", "Enter 'sharethis' for username"],
                ["st_followId", "Follow id", "Enter '1234567' for follow id"]
            ]
        },
        googleplusfollow: {
            log: true,
            config: true,
            requiredFields: [
                ["st_followId", "Page Id", "Enter '110967630299632321627' for page id"]
            ]
        },
        googleplusadd: {
            log: true,
            config: true,
            requiredFields: [
                ["st_followId", "Profile Id", "Enter '113842823840690472625' for profile id"]
            ]
        }
    },
    loadService: function(a) {
        if (a == "foursquaresave" || a == "foursquarefollow") {
            if (stlib.nativeButtons.supportedNativeButtons.foursquaresave.dependencyLoaded == false) {
                if (stlib.nativeButtons.supportedNativeButtons.foursquaresave.dependencyLoading == false) {
                    stlib.nativeButtons.supportedNativeButtons.foursquaresave.dependencyLoading = true;
                    var d = "http://platform.foursquare.com/js/widgets.js";
                    var b = {
                        uid: "606"
                    };
                    if ("https:" == document.location.protocol) {
                        d = "http://platform-s.foursquare.com/js/widgets.js";
                        b.secure = true
                    }(function() {
                        window.___fourSq = b;
                        var e = document.createElement("script");
                        e.type = "text/javascript";
                        e.src = d;
                        e.async = true;
                        var f = document.getElementsByTagName("script")[0];
                        e.onload = function() {
                            fourSq.widget.Factory.go();
                            stlib.nativeButtons.supportedNativeButtons.foursquaresave.dependencyLoaded = true;
                            stlib.nativeButtons.supportedNativeButtons.foursquaresave.dependencyLoading = false
                        };
                        e.onreadystatechange = function() {
                            if (this.readyState == "complete" || this.readyState == "loaded") {
                                fourSq.widget.Factory.go();
                                stlib.nativeButtons.supportedNativeButtons.foursquaresave.dependencyLoaded = true;
                                stlib.nativeButtons.supportedNativeButtons.foursquaresave.dependencyLoading = false
                            }
                        };
                        f.parentNode.insertBefore(e, f)
                    })()
                }
            } else {
                fourSq.widget.Factory.go()
            }
        } else {
            if (a == "pinterestfollow") {} else {
                if (a == "twitterfollow") {} else {
                    if (a == "youtube") {} else {
                        if (a == "linkedinfollow") {
                            if (window.IN && typeof(window.IN.parse) === "function") {
                                window.IN.parse()
                            } else {
                                if (stlib.nativeButtons.supportedNativeButtons.linkedinfollow.dependencyLoading == false) {
                                    stlib.nativeButtons.supportedNativeButtons.linkedinfollow.dependencyLoading = true;
                                    var d = "//platform.linkedin.com/in.js";
                                    (function() {
                                        var e = document.createElement("script");
                                        e.type = "text/javascript";
                                        e.src = d;
                                        e.async = true;
                                        var f = document.getElementsByTagName("script")[0];
                                        e.onload = function() {
                                            stlib.nativeButtons.supportedNativeButtons.linkedinfollow.dependencyLoading = false
                                        };
                                        e.onreadystatechange = function() {
                                            if (this.readyState == "complete" || this.readyState == "loaded") {
                                                stlib.nativeButtons.supportedNativeButtons.linkedinfollow.dependencyLoading = false
                                            }
                                        };
                                        f.parentNode.insertBefore(e, f)
                                    })()
                                }
                            }
                        } else {}
                    }
                }
            }
        }
    },
    logService: function(a, b) {
        stlib.data.resetShareData();
        stlib.data.set("url", b, "shareInfo");
        stlib.data.set("destination", a, "shareInfo");
        stlib.data.setSource("chicklet");
        stlib.data.set("buttonType", "chicklet", "shareInfo");
        stlib.sharer.share()
    },
    makeButton: function(w, e, d) {
        if (w == "foursquaresave") {
            try {
                var k = document.createElement("<div></div>");
                var i = document.createElement("<a></a>")
            } catch (h) {
                k = document.createElement("div");
                i = document.createElement("a")
            }
            k.className = "stNativeButton stFourSquare";
            i.setAttribute("href", "https://foursquare.com/intent/venue.html");
            i.setAttribute("class", "fourSq-widget");
            i.setAttribute("data-on-open", "foursquareCallback");
            k.appendChild(i);
            return k
        } else {
            if (w == "foursquarefollow") {
                if (typeof(d.username) == "undefined" || d.username == "") {
                    return false
                }
                if (typeof(d.followId) == "undefined" || d.followId == "") {
                    return false
                }
                try {
                    var k = document.createElement("<div></div>");
                    var i = document.createElement("<a></a>")
                } catch (h) {
                    k = document.createElement("div");
                    i = document.createElement("a")
                }
                k.className = "stNativeButton stFourSquare";
                i.setAttribute("href", "https://foursquare.com/user/" + d.username);
                i.setAttribute("class", "fourSq-widget");
                i.setAttribute("data-type", "follow");
                i.setAttribute("data-fuid", d.followId);
                i.setAttribute("data-on-open", "foursquareCallback");
                k.appendChild(i);
                return k
            } else {
                if (w == "googleplusfollow" || w == "googleplusadd") {
                    if (typeof(d.followId) == "undefined" || d.followId == "") {
                        return false
                    }
                    try {
                        var q = document.createElement("<span></span>")
                    } catch (h) {
                        q = document.createElement("span")
                    }
                    q.className = "stNativeButton stGoogleNative";
                    var o = document.createElement("g:plus");
                    o.setAttribute("href", "https://plus.google.com/" + d.followId);
                    o.setAttribute("width", "300");
                    o.setAttribute("height", "69");
                    q.appendChild(o);
                    return q
                } else {
                    if (w == "pinterestfollow") {
                        if (typeof(d.username) == "undefined" || d.username == "") {
                            return false
                        }
                        try {
                            var b = document.createElement("<span></span>");
                            var p = document.createElement("<a></a>");
                            var n = document.createElement("<img></img>")
                        } catch (h) {
                            b = document.createElement("span");
                            p = document.createElement("a");
                            n = document.createElement("img")
                        }
                        b.className = "stNativeButton stPinterestfollow";
                        var g = d.username;
                        p.setAttribute("target", "_blank");
                        p.setAttribute("href", "//pinterest.com/" + g + "/");
                        n.setAttribute("src", "//passets-cdn.pinterest.com/images/follow-on-pinterest-button.png");
                        n.setAttribute("width", "156");
                        n.setAttribute("height", "26");
                        n.setAttribute("alt", "Follow " + g + " on Pinterest");
                        p.appendChild(n);
                        b.appendChild(p);
                        return b
                    } else {
                        if (w == "twitterfollow") {
                            if (typeof(d.username) == "undefined" || d.username == "") {
                                return false
                            }
                            try {
                                var j = document.createElement("<iframe></iframe>")
                            } catch (h) {
                                j = document.createElement("iframe")
                            }
                            var l = "&screen_name=" + d.username;
                            var r = "&show_count=false";
                            iedocmode = stlib.browser.getIEVersion();
                            var v = "";
                            if (e == "vcount") {
                                r = "&show_count=true"
                            } else {
                                if (e == "hcount") {
                                    r = "&show_count=true"
                                }
                            }
                            j.setAttribute("allowtransparency", "true");
                            j.setAttribute("frameborder", "0");
                            j.setAttribute("scrolling", "no");
                            j.className = "stTwitterFollowFrame";
                            j.setAttribute("src", "//platform.twitter.com/widgets/follow_button.html?lang=en&show_screen_name=false" + l + r);
                            var u = document.createElement("span");
                            u.className = "stNativeButton stTwitterFollowFrame stTwitterFollow";
                            u.appendChild(j);
                            return u
                        } else {
                            if (w == "youtube") {
                                if (typeof(d.username) == "undefined" || d.username == "") {
                                    return false
                                }
                                try {
                                    var m = document.createElement("<span></span>");
                                    var f = document.createElement("<a></a>");
                                    var a = document.createElement("<img></img>")
                                } catch (h) {
                                    m = document.createElement("span");
                                    f = document.createElement("a");
                                    a = document.createElement("img")
                                }
                                m.setAttribute("class", "stNativeButton stYoutube");
                                var g = d.username;
                                f.setAttribute("target", "_blank");
                                f.setAttribute("href", "//youtube.com/subscription_center?add_user=" + g);
                                a.setAttribute("src", "//s.ytimg.com/yt/img/creators_corner/Subscribe_to_my_videos/YT_Subscribe_130x36_red.png");
                                a.setAttribute("alt", "Follow " + g + " on youtube");
                                f.appendChild(a);
                                m.appendChild(f);
                                return m
                            } else {
                                if (w == "linkedinfollow") {
                                    if (typeof(d.followId) == "undefined" || d.followId == "") {
                                        return false
                                    }
                                    var s = document.createElement("span");
                                    s.setAttribute("class", "stNativeButton stLinkedinfollow");
                                    var t = document.createElement("script");
                                    t.type = "text/javascript";
                                    t.setAttribute("type", "IN/FollowCompany");
                                    t.setAttribute("data-id", d.followId);
                                    t.setAttribute("data-counter", "none");
                                    if (e == "vcount") {
                                        t.setAttribute("data-counter", "top")
                                    } else {
                                        if (e == "hcount") {
                                            t.setAttribute("data-counter", "right")
                                        }
                                    }
                                    s.appendChild(t);
                                    return s
                                } else {}
                            }
                        }
                    }
                }
            }
        }
    },
    checkNativeButtonSupport: function(a) {
        if (stlib.nativeButtons.supportedNativeButtons[a]) {
            return true
        }
        return false
    },
    checkNativeButtonLogging: function(a) {
        if (stlib.nativeButtons.supportedNativeButtons[a]) {
            return stlib.nativeButtons.supportedNativeButtons[a].log
        }
        return false
    },
    checkNativeButtonConfig: function(a) {
        if (stlib.nativeButtons.supportedNativeButtons[a]) {
            return stlib.nativeButtons.supportedNativeButtons[a].config
        }
        return false
    }
};
foursquareCallback = function(d) {
    if (d) {
        var a = "foursquaresave";
        var b = "https://foursquare.com/intent/venue.html";
        if (d.config.type) {
            a = "foursquarefollow";
            b = "https://foursquare.com/user/" + d.config.fuid
        }
        stlib.nativeButtons.logService(a, b)
    }
};
stlib.nativeCounts = {
    nativeCountServices: {
        linkedin: true,
        facebook: true,
        stumbleupon: true
    },
    nativeFunc: [],
    addNativeFunc: function(b, a) {
        stlib.nativeCounts.nativeFunc[b] = a
    },
    getNativeCounts: function(d, b, a) {
        switch (d) {
            case "facebook":
                stlib.scriptLoader.loadJavascript("http://api.facebook.com/method/fql.query?format=json&query=select url, like_count, total_count, comment_count, share_count, click_count from link_stat where url='" + encodeURIComponent(b) + "'&callback=" + a, function() {});
                break;
            case "linkedin":
                stlib.scriptLoader.loadJavascript("//www.linkedin.com/countserv/count/share?format=jsonp&callback=" + a + "&url=" + encodeURIComponent(b), function() {});
                break;
            case "stumbleupon":
                stlib.scriptLoader.loadJavascript("http://www.stumbleupon.com/services/1.1/badge.getinfo?url=" + encodeURIComponent(b) + "&format=jsonp&callback=" + a, function() {});
                break
        }
    },
    checkNativeCountServicesQueue: function(a) {
        if (stlib.nativeCounts.nativeCountServices[a]) {
            return true
        }
        return false
    }
};
var stWidgetVersion = false;
if (typeof(switchTo5x) == "undefined") {
    stWidgetVersion = "4x"
} else {
    if (switchTo5x == false) {
        stWidgetVersion = "4x"
    }
    if (switchTo5x == true) {
        stWidgetVersion = "5xa"
    }
}
__stgetPubGA = function() {
    if (typeof(_gaq) !== "undefined" && typeof(__stPubGA) == "undefined") {
        if (typeof(_gat) !== "undefined") {
            __stPubGA = _gat._getTrackerByName("~0")._getAccount()
        }
        if (typeof(__stPubGA) !== "undefined" && __stPubGA == "UA-XXXXX-X") {
            _gaq.push(function() {
                var a = _gat._getTrackerByName();
                __stPubGA = a._getAccount()
            })
        }
    } else {
        if (typeof(ga) !== "undefined" && typeof(__stPubGA) == "undefined") {
            ga(function() {
                var f = ga.getAll();
                for (var b = 0; b < f.length; ++b) {
                    var d = f[b];
                    var a = d.get("trackingId");
                    var e = a.indexOf("UA");
                    if (e >= 0) {
                        __stPubGA = a
                    }
                }
            })
        }
    }
    if (__stPubGA == "UA-XXXXX-X") {
        delete __stPubGA
    }
};
if (typeof(stLight) == "undefined" && typeof(SHARETHIS) == "undefined") {
    var stRecentServices = false;
    if (typeof(switchTo5x) == "undefined") {
        stWidgetVersion = "4x"
    } else {
        if (switchTo5x == false) {
            stWidgetVersion = "4x"
        }
        if (switchTo5x == true) {
            stWidgetVersion = "5xa"
        }
    }
    var esiLoaded = false,
        esiStatus = "",
        stIsLoggedIn = false,
        servicesLoggedIn = {};
    var stFastShareObj = {};
    stFastShareObj.shorten = true;
    if (typeof(useEdgeSideInclude) == "undefined") {
        var useEdgeSideInclude = true
    }
    if ("https:" == document.location.protocol) {
        var useFastShare = false;
        var useEdgeSideInclude = false
    }
    if (typeof(useFastShare) == "undefined") {
        var useFastShare = true
    }
    stLight = new function() {
        this.version = false;
        this.publisher = null;
        this.sessionID_time = (new Date()).getTime().toString();
        this.sessionID_rand = Number(Math.random().toPrecision(5).toString().substr(2)).toString();
        this.sessionID = this.sessionID_time + "." + this.sessionID_rand;
        this.fpc = null;
        this.counter = 0;
        this.readyRun = false;
        this.meta = {
            hostname: document.location.host,
            location: document.location.pathname
        };
        this.loadedFromBar = false;
        this.clickCallBack = false
    };
    stLight.onReady = function() {
        if (stLight.readyRun == true) {
            return false
        }
        stLight.readyRun = true;
        stlib.stfp.init();
        
    };
    stLight.getSource = function() {
        var a = "share4x";
        if (stWidgetVersion == "5xa") {
            a = "share5x"
        }
        if (stLight.hasButtonOnPage()) {
            if (stLight.loadedFromBar) {
                if (stWidgetVersion == "5xa") {
                    a = "bar_share5x"
                } else {
                    a = "bar_share4x"
                }
            }
        } else {
            if (stLight.loadedFromBar) {
                a = "bar"
            }
        }
        return a
    };
    stLight.getSource2 = function(a) {
        var d = "share4x";
        if (stWidgetVersion == "5xa") {
            d = "share5x";
            try {
                if (stLight.clickCallBack != false) {
                    stLight.clickCallBack(a.service)
                }
            } catch (b) {}
        }
        if (a.type == "stbar" || a.type == "stsmbar") {
            d = "bar"
        }
        return d
    };
    stLight.log = function(d, e, a, b) {
        stlib.data.resetShareData();
        stlib.data.set("url", document.location.href, "shareInfo");
        stlib.data.set("title", document.title, "shareInfo");
        stlib.data.set("counter", stLight.counter++, "shareInfo");
        stlib.data.setSource(e);
        if (typeof(a) != "undefined") {
            stlib.data.set("destination", a, "shareInfo")
        }
        if (typeof(b) != "undefined") {
            stlib.data.set("buttonType", b, "shareInfo")
        }
        stlib.logger.log(d);
        if (d == "pview") {
            stLight.createSegmentFrame()
        }
    };
    stLight._stFpc = function() {
        if (!document.domain || document.domain.search(/\.gov/) > 0) {
            return false
        }
        var h = stLight._stGetFpc("__unam");
        if (h == false) {
            var d = Math.round(Math.random() * 2147483647);
            d = d.toString(16);
            var i = (new Date()).getTime();
            i = i.toString(16);
            var f = "";
            var a = stLight._stGetD();
            a = a.split(/\./)[1];
            if (!a) {
                return false
            }
            f = stLight._stdHash(a) + "-" + i + "-" + d + "-1";
            h = f;
            stLight._stSetFpc(h)
        } else {
            var b = h;
            var g = b.split(/\-/);
            if (g.length == 4) {
                var e = Number(g[3]);
                e++;
                b = g[0] + "-" + g[1] + "-" + g[2] + "-" + e;
                h = b;
                stLight._stSetFpc(h)
            }
        }
        return h
    };
    stLight._stSetFpc = function(h) {
        var a = "__unam";
        var d = new Date;
        var j = d.getFullYear();
        var g = d.getMonth() + 9;
        var i = d.getDate();
        var e = a + "=" + escape(h);
        if (j) {
            var b = new Date(j, g, i);
            e += "; expires=" + b.toGMTString()
        }
        var f = stLight._stGetD();
        e += "; domain=" + escape(f) + ";path=/";
        document.cookie = e
    };
    stLight._stGetD = function() {
        var b = document.domain.split(/\./);
        var a = "";
        if (b.length > 1) {
            a = "." + b[b.length - 2] + "." + b[b.length - 1]
        }
        return a
    };
    stLight._stGetFpc = function(b) {
        var a = document.cookie.match("(^|;) ?" + b + "=([^;]*)(;|$)");
        if (a) {
            return (unescape(a[2]))
        } else {
            return false
        }
    };
    stLight._stdHash = function(a) {
        var f = 0,
            e = 0;
        for (var d = a.length - 1; d >= 0; d--) {
            var b = parseInt(a.charCodeAt(d));
            f = ((f << 8) & 268435455) + b + (b << 12);
            if ((e = f & 161119850) != 0) {
                f = (f ^ (e >> 20))
            }
        }
        return f.toString(16)
    };
    stLight._thisScript = null;
    stLight.getShareThisLightScript = function() {
        var e = document.getElementsByTagName("script");
        var d = null;
        for (var b = 0; b < e.length; b++) {
            var a = e[b].src;
            if (a.search(/.*sharethis.*\/button\/light.*/) >= 0) {
                d = e[b]
            }
        }
        return d
    };
    stLight.dbrInfo = function() {
        var j = document.referrer;
        if (j && j.length > 0) {
            var h = /\/\/.*?\//;
            var e = j.match(h);
            if (typeof(e) !== "undefined" && typeof(e[0]) !== "undefined") {
                var b = new RegExp(document.domain, "gi");
                if (b.test(e[0]) == true) {
                    return false
                }
            }
            var g = /(http:\/\/)(.*?)\/.*/i;
            var f = /(^.*\?)(.*)/ig;
            var a = "";
            var d = j.replace(g, "$2");
            var b = new RegExp(d, "gi");
            if (d.length > 0) {
                a += "&refDomain=" + d
            } else {
                return false
            }
            var i = j.replace(f, "$2");
            if (i.length > 0) {
                a += "&refQuery=" + encodeURIComponent(i)
            }
            return a
        } else {
            return false
        }
    };
    stLight.odjs = function(a, b) {
        this.head = document.getElementsByTagName("head")[0];
        this.scriptSrc = a;
        this.script = document.createElement("script");
        this.script.setAttribute("type", "text/javascript");
        this.script.setAttribute("src", this.scriptSrc);
        if (window.attachEvent && document.all) {
          
        } else {
            this.script.onload = b
        }
        this.head.appendChild(this.script)
    };
    
  
    stLight.allDefault = function(a) {
        if (a) {
            if (a.cns) {
                stLight.cnsDefault(a.cns)
            }
            if (a.snapsets) {
                stLight.snapSetsDefault(a.snapsets)
            }
            if (a.migration) {
                stLight.migrationDefault(a.migration)
            } else {
                stLight.usePublisherDefaultSettings()
            }
        } else {
            stLight.usePublisherDefaultSettings()
        }
    };
    stLight.usePublisherDefaultSettings = function() {
        if (typeof(switchTo5x) == "undefined") {
            stWidgetVersion = "4x"
        } else {
            if (switchTo5x == false) {
                stWidgetVersion = "4x"
            }
            if (switchTo5x == true) {
                stWidgetVersion = "5xa"
            }
        }
    };
    stLight.migrationDefault = function(a) {
        if (stWidget.skipESIValue == false) {
            if (stLight.version) {
                stWidgetVersion = stLight.version
            } else {
                if ((stWidget.options.lang == "") || (stWidget.options.lang == "en")) {
                    if ((typeof(a) !== "undefined") && (a.version !== "")) {
                        if (a.version == "5x") {
                            stWidgetVersion = "5xa"
                        } else {
                            stWidgetVersion = a.version
                        }
                    }
                }
                if (stWidgetVersion == false) {
                    stLight.usePublisherDefaultSettings()
                } else {
                    stWidget.options.publisherMigration = true
                }
            }
        }
        if (stWidgetVersion == "5x" || stLight.version == "5x") {
            stWidgetVersion = "5xa"
        }
    };
    stLight.snapSetsDefault = function(a) {
        if (a) {
            if (a.override) {
                stWidget.options.snapsets = a.snapsets
            } else {
                if (stWidget.options.snapsets == null) {
                    stWidget.options.snapsets = a.snapsets
                }
            }
        }
    };
    stLight.cnsDefault = function(a) {
        if (a) {
            if (a.override) {
                stWidget.options.doNotHash = a.doNotHash;
                stWidget.options.hashAddressBar = a.hashAddressBar;
                stWidget.options.doNotCopy = a.doNotCopy
            } else {
                if (stWidget.options.doNotHash == null) {
                    stWidget.options.doNotHash = a.doNotHash
                }
                if (stWidget.options.hashAddressBar == null) {
                    stWidget.options.hashAddressBar = a.hashAddressBar
                }
                if (stWidget.options.doNotCopy == null) {
                    stWidget.options.doNotCopy = a.doNotCopy
                }
            }
            stlib.hash.doNotHash = stWidget.options.doNotHash = (/true/i).test(stWidget.options.doNotHash) ? true : false;
            stlib.hash.hashAddressBar = stWidget.options.hashAddressBar = (/true/i).test(stWidget.options.hashAddressBar) ? true : false;
            stlib.hash.doNotCopy = stWidget.options.doNotCopy = (/true/i).test(stWidget.options.doNotCopy) ? true : false
        }
    };
    stLight.loadServicesLoggedIn = function(b) {
        if (useFastShare && esiLoaded == false) {
            // try {
            //     stLight.odjs((("https:" == document.location.protocol) ? "https://wd-edge.sharethis.com/button/checkOAuth.esi" : "http://wd-edge.sharethis.com/button/checkOAuth.esi"), function() {
            //         if (typeof(userDetails) !== "undefined") {
            //             stIsLoggedIn = true;
            //             if (userDetails !== "null") {
            //                 servicesLoggedIn = userDetails
            //             }
            //         }
            //         esiLoaded = true;
            //         if (b != null) {
            //             b()
            //         }
            //     })
            // } catch (a) {}
        } else {
            if (b != null) {
                b()
            }
        }
    };
    if (window.document.readyState == "completed") {
        stLight.onReady()
    } else {
        if (typeof(window.addEventListener) != "undefined") {
            window.addEventListener("load", stLight.onReady, false)
        } else {
            if (typeof(document.addEventListener) != "undefined") {
                document.addEventListener("load", stLight.onReady, false)
            } else {
                if (typeof window.attachEvent != "undefined") {
                    window.attachEvent("onload", stLight.onReady)
                }
            }
        }
    }
    stLight.createSegmentFrame = function() {
        try {
            stLight.segmentframe = document.createElement('<iframe name="stframe" allowTransparency="true" style="body{background:transparent;}" ></iframe>')
        } catch (b) {
            stLight.segmentframe = document.createElement("iframe")
        }
        stLight.segmentframe.id = "stSegmentFrame";
        stLight.segmentframe.name = "stSegmentFrame";
        var d = document.body;
        var a = (("https:" == document.location.protocol) ? "https://seg." : "http://seg.") + "sharethis.com/getSegment.php?purl=" + encodeURIComponent(document.location.href) + "&jsref=" + encodeURIComponent(document.referrer) + "&rnd=" + (new Date()).getTime();
        stLight.segmentframe.src = a;
        stLight.segmentframe.frameBorder = "0";
        stLight.segmentframe.scrolling = "no";
        stLight.segmentframe.width = "0px";
        stLight.segmentframe.height = "0px";
        stLight.segmentframe.setAttribute("style", "display:none;");
        d.appendChild(stLight.segmentframe)
    };
    stLight.options = function(a) {
        if (a && a.version) {
            stLight.version = a.version
        }
        if (a && a.publisher) {
            stlib.data.setPublisher(a.publisher);
            stLight.publisher = a.publisher
        }
        if (a && a.loadedFromBar) {
            stLight.loadedFromBar = a.loadedFromBar
        }
        if (a && a.clickCallBack && typeof(a.clickCallBack) == "function") {
            stLight.clickCallBack = a.clickCallBack
        }
        if (a && typeof(a.hashAddressBar) != "undefined") {
            stlib.hash.hashAddressBar = a.hashAddressBar
        }
        if (a && typeof(a.doNotHash) != "undefined") {
            stlib.hash.doNotHash = a.doNotHash
        }
        if (a && typeof(a.doNotCopy) != "undefined") {
            stlib.hash.doNotCopy = a.doNotCopy
        }
        for (var b in a) {
            if (b == "shorten") {
                stFastShareObj.shorten = a[b]
            }
            if (stWidget.options.hasOwnProperty(b) && a[b] !== null) {
                stWidget.options[b] = a[b]
            }
        }
    };
    stLight.hasButtonOnPage = function() {
        var e = document.getElementsByTagName("*");
        var d = new RegExp(/^st_(.*?)$/);
        var a = e.length;
        for (var b = 0; b < a; b++) {
            if (typeof(e[b].className) == "string" && e[b].className != "") {
                if (e[b].className.match(d) && e[b].className.match(d).length >= 2 && e[b].className.match(d)[1]) {
                    return true
                }
            }
        }
        return false
    }
}
var stButtons = {};
stButtons.smartifyButtons = function(a) {
    if (typeof(a) != "undefined" && a != "undefined") {
        stRecentServices = a;
        for (var b in stRecentServices) {
            stRecentServices[b].processed = false
        }
    }
    stButtons.completeInit()
};
stButtons.makeButton = function(w) {
    var g = w.service;
    var I = w.text;
    var Z = "";
    if (typeof(stWidget.options.shorten) != "undefined") {
        Z = stWidget.options.shorten
    }
    if (I == null && (w.type == "vcount" || w.type == "hcount")) {
        I = "Share";
        if (g == "email") {
            I = "Mail"
        }
    }
    if (g == "fb_like") {
        g = "fblike"
    } else {
        if (g == "fblike_fbLong") {
            g = "fblike";
            w.type = "fbLong"
        }
    }
    var h = stWidget.ogurl ? stWidget.ogurl : (stWidget.twitterurl ? stWidget.twitterurl : document.location.href);
    h = w.url ? w.url : h;
    var V = h;
    if (!stlib.hash.doNotHash) {
        V = stlib.hash.appendHash(h);
        h = V
    }
    stlib.data.set("url", V, "shareInfo");
    var O = (w.short_url != null) ? w.short_url : "";
    var L = stWidget.ogtitle ? stWidget.ogtitle : (stWidget.twittertitle ? stWidget.twittertitle : document.title);
    L = w.title ? w.title : L;
    if (typeof(w.pinterest_native) == "string") {
        w.pinterest_native = w.pinterest_native.replace(/^\s+|\s+$/g, "")
    }
    if (g == "pinterest" && (w.pinterest_native == "false" || w.pinterest_native == null || w.pinterest_native == "")) {
        var f = stWidget.ogimg ? stWidget.ogimg : (stWidget.twitterimg ? stWidget.twitterimg : (w.thumbnail ? w.thumbnail : null));
        if (typeof(f) == "string") {
            f = f.replace(/^\s+|\s+$/g, "")
        }
        if (typeof(w.image) == "string") {
            w.image = w.image.replace(/^\s+|\s+$/g, "")
        }
        f = (w.image) ? w.image : f
    }
    var aa = stWidget.desc ? stWidget.desc : "";
    aa = stWidget.ogdesc ? stWidget.ogdesc : (stWidget.twitterdesc ? stWidget.twitterdesc : stWidget.desc);
    aa = (w.summary && w.summary != null) ? w.summary : aa;
    var s = (w.message && w.message != null) ? w.message : "";
    if (/(http|https):\/\//.test(h) == false) {
        h = decodeURIComponent(h);
        L = decodeURIComponent(L)
    }
    if (/(http|https):\/\//.test(O) == false) {
        O = decodeURIComponent(O)
    }
    var ag = document.createElement("span");
    ag.setAttribute("style", "text-decoration:none;color:#000000;display:inline-block;cursor:pointer;");
    ag.className = "stButton";
    if (w.type == "custom" && g != "email" && g != "sharethis" && g != "wordpress" && g != "whatsapp") {
        w.element.onclick = function() {
            _$d_();
            _$d1("Clicked on a custom button to share");
            stLight.callSubscribers("click", g, h);
            stlib.data.resetShareData();
            stlib.data.set("url", h, "shareInfo");
            stlib.data.set("short_url", O, "shareInfo");
            stlib.data.set("shorten", Z, "shareInfo");
            stlib.data.set("title", L, "shareInfo");
            stlib.data.set("destination", g, "shareInfo");
            stlib.data.setSource("chicklet");
            stlib.data.set("buttonType", w.type, "shareInfo");
            if (typeof(pinterest_native) != "undefined" && pinterest_native != null && pinterest_native != " ") {
                stlib.data.set("pinterest_native", pinterest_native, "shareInfo")
            }
            if (typeof(f) != "undefined" && f != null && f != " ") {
                stlib.data.set("image", f, "shareInfo")
            }
            if (typeof(aa) != "undefined" && aa != null) {
                stlib.data.set("description", aa, "shareInfo")
            }
            if (s != "") {
                stlib.data.set("message", s, "shareInfo")
            }
            if (w.element.getAttribute("st_username") != null) {
                stlib.data.set("refUsername", w.element.getAttribute("st_username"), "shareInfo")
            }
            if (g == "twitter" && w.element.getAttribute("st_via") != null) {
                stlib.data.set("via", w.element.getAttribute("st_via").replace(/^\s+|\s+$/g, ""), "shareInfo")
            }
            stlib.sharer.share(null, stWidget.options.servicePopup);
            if (g == "pinterest") {
                stlib.sharer.sharePinterest()
            }
        };
        return false
    }
    if (!((g == "email" || g == "sharethis" || g == "wordpress") || (stIsLoggedIn && servicesLoggedIn && typeof(servicesLoggedIn[g]) != "undefined" && ((useFastShare || (!useFastShare && switchTo5x)) && (g == "facebook" || g == "twitter" || g == "yahoo" || g == "linkedin"))))) {
        ag.onclick = function() {
            if (!stlib.browser.mobile.isIOs() && (g == "whatsapp" && window.location.pathname.indexOf("get-sharing-tools") != -1)) {} else {
                _$d_();
                _$d1("Clicked on a regular button to share");
                stLight.callSubscribers("click", g, h);
                var b = this.getElementsByTagName("*");
                for (var a = 0; a < b.length; a++) {
                    if (b[a].className == "stBubble_hcount" || b[a].className == "stBubble_count") {
                        if (!stWidget.options.nativeCount || !stlib.nativeCounts.checkNativeCountServicesQueue(g)) {
                            if (!isNaN(b[a].innerHTML)) {
                                b[a].innerHTML = Number(b[a].innerHTML) + 1
                            }
                        }
                    }
                }
                if (stWidget.options.tracking) {
                    shareLog(g, h)
                }
                stlib.data.resetShareData();
                var ai = "";
                var ah = stLight.getSource();
                if (ah == "share5x") {
                    ai = "5x"
                } else {
                    if (ah == "share4x") {
                        ai = "4x"
                    }
                }
                stlib.data.set("url", h, "shareInfo");
                stlib.data.set("short_url", O, "shareInfo");
                stlib.data.set("shorten", Z, "shareInfo");
                stlib.data.set("title", L, "shareInfo");
                stlib.data.set("destination", g, "shareInfo");
                stlib.data.setSource("chicklet" + ai);
                stlib.data.set("buttonType", w.type, "shareInfo");
                if (typeof(pinterest_native) != "undefined" && pinterest_native != null && pinterest_native != " ") {
                    stlib.data.set("pinterest_native", pinterest_native, "shareInfo")
                }
                if (typeof(f) != "undefined" && f != null) {
                    stlib.data.set("image", f, "shareInfo")
                }
                if (typeof(aa) != "undefined" && aa != null) {
                    stlib.data.set("description", aa, "shareInfo")
                }
                if (s != "") {
                    stlib.data.set("message", s, "shareInfo")
                }
                if (w.element.getAttribute("st_username") != null) {
                    stlib.data.set("refUsername", w.element.getAttribute("st_username"), "shareInfo")
                }
                if (g == "twitter" && w.element.getAttribute("st_via") != null) {
                    stlib.data.set("via", w.element.getAttribute("st_via").replace(/^\s+|\s+$/g, ""), "shareInfo")
                }
                stlib.sharer.share(null, stWidget.options.servicePopup);
                if (g == "pinterest" && (stlib.data.get("image", "shareInfo") == false || stlib.data.get("image", "shareInfo") == null)) {
                    stlib.sharer.sharePinterest()
                }
            }
        }
    }
    if (g == "gbuzz") {
        return ag
    }
    if (g == "fblike" || g == "fbsend" || g == "fbrec" || g == "fbLong" || g == "fbsub") {
        if (g == "fbsub") {
            if (w.element.getAttribute("st_username") != null) {
                h = "http://facebook.com/" + w.element.getAttribute("st_username")
            } else {
                h = ""
            }
        }
        return stButtons.makeFBButton(g, w.type, h)
    }
    if (stlib.nativeButtons.checkNativeButtonSupport(g)) {
        var W = {};
        if (w.element.getAttribute("st_username") != null) {
            W.username = w.element.getAttribute("st_username")
        }
        if (w.element.getAttribute("st_followId") != null) {
            W.followId = w.element.getAttribute("st_followId")
        }
        retObj = stlib.nativeButtons.makeButton(g, w.type, W);
        if (retObj) {
            if (stlib.nativeButtons.checkNativeButtonLogging(g)) {
                retObj.onclick = function() {
                    stlib.nativeButtons.logService(g, h)
                }
            }
            return retObj
        } else {
            if (typeof(window.console) !== "undefined") {
                try {
                    console.debug("Looks like " + g + " is missing some required parameters. Please recheck " + g + " HTML \nFor help, contact support@sharethis.com")
                } catch (ab) {}
            }
            return ag
        }
    }
    if (g == "plusone") {
        stButtons.loadPlusone = true;
        var G = document.createElement("div");
        G.innerHTML = "&nbsp;";
        iedocmode = stlib.browser.getIEVersion();
        var x = (navigator.userAgent.indexOf("MSIE 7.0") != -1);
        var i = (navigator.userAgent.indexOf("Safari") != -1 && navigator.userAgent.indexOf("Chrome") == -1);
        var Q = "display:inline-block;overflow:hidden;line-height:0px;";
        var D = "overflow:hidden;zoom:1;display:inline;vertical-align:bottom;";
        var E = "overflow:hidden;zoom:1;display:inline;line-height:0px;position:relative;";
        var e = document.createElement("g:plusone");
        var l = h;
        if ((/#sthash/i).test(l)) {
            var n = l.split("#");
            if (n.length > 0) {
                l = n[0]
            }
        }
        e.setAttribute("href", l);
        if (w.type == "vcount") {
            e.setAttribute("size", "tall");
            G.setAttribute("style", Q + "vertical-align:bottom;width:55px; height:61px;");
            x && G.style.setAttribute ? G.style.setAttribute("cssText", Q + "vertical-align:bottom;width:55px; height:61px;", 0) : null;
            (iedocmode && (iedocmode == 7) && G.style.setAttribute) ? G.style.setAttribute("cssText", E + "vertical-align:bottom;bottom:-8px;width:55px; height:80px;", 0): (null)
        } else {
            if (w.type == "hcount") {
                e.setAttribute("size", "medium");
                e.setAttribute("count", "true");
                G.setAttribute("style", Q + "position:relative;vertical-align:middle;bottom:0px;width:75px; height:21px;");
                x && G.style.setAttribute ? G.style.setAttribute("cssText", Q + "position:relative;vertical-align:middle;width:75px; height:21px;", 0) : null;
                (iedocmode && (iedocmode == 7) && G.style.setAttribute) ? G.style.setAttribute("cssText", E + "vertical-align:middle;bottom:2px;width:75px; height:21px;", 0): (null)
            } else {
                if (w.type == "button") {
                    e.setAttribute("size", "medium");
                    e.setAttribute("count", "false");
                    G.setAttribute("style", Q + "position:relative;vertical-align:middle;bottom:0px;width:36px; height:21px;");
                    x && G.style.setAttribute ? G.style.setAttribute("cssText", Q + "position:relative;vertical-align:middle;width:36px; height:21px;", 0) : null;
                    (iedocmode && (iedocmode == 7) && G.style.setAttribute) ? G.style.setAttribute("cssText", E + "vertical-align:middle;bottom:-8px;width:36px; height:39px;", 0): (null)
                } else {
                    if (w.type == "large") {
                        e.setAttribute("size", "large");
                        e.setAttribute("count", "false");
                        G.setAttribute("style", Q + "position:relative;vertical-align:middle;bottom:12px;width:38px; height:27px;");
                        x && G.style.setAttribute ? G.style.setAttribute("cssText", Q + "position:relative;vertical-align:middle;bottom:0px;width:38px; height:30px;", 0) : null;
                        (iedocmode && ((iedocmode == 8) || (iedocmode == 9)) && G.style.setAttribute) ? G.style.setAttribute("cssText", E + "vertical-align:middle;bottom:7px;width:38px; height:39px;", 0): (null);
                        (iedocmode && (iedocmode == 7) && G.style.setAttribute) ? G.style.setAttribute("cssText", E + "vertical-align:middle;bottom:1px;width:38px; height:39px;", 0): (null)
                    } else {
                        e.setAttribute("size", "small");
                        e.setAttribute("count", "false");
                        G.setAttribute("style", Q + "position:relative;vertical-align:middle;bottom:0px;width:36px; height:16px;");
                        x && G.style.setAttribute ? G.style.setAttribute("cssText", Q + "position:relative;vertical-align:middle;width:36px; height:16px;", 0) : null;
                        (iedocmode && (iedocmode == 7) && G.style.setAttribute) ? G.style.setAttribute("cssText", E + "vertical-align:middle;bottom:-12px;width:36px; height:36px;", 0): (null)
                    }
                }
            }
        }
        G.appendChild(e);
        e.setAttribute("callback", "plusoneCallback");
        return G
    }
    var j = ("https:" == document.location.protocol) ? "https://ws.sharethis.com/images/" : "http://w.sharethis.com/images/";
    var t = g;

    function o(a) {
        var ah = new Date();
        var b = null;
        var ai = 0;
        do {
            b = new Date();
            ai++;
            if (ai > a) {
                break
            }
        } while (((b - ah) < a) || !esiLoaded)
    }
    if (!esiLoaded && (g == "facebook" || g == "twitter" || g == "linkedin" || g == "yahoo")) {
        o(500)
    }
    if (w.type == "chicklet") {
        var N = document.createElement("span");
        N.className = "chicklets " + g;
        if (I == null) {
            N.innerHTML = "&nbsp;";
            ag.style.paddingLeft = "0px";
            ag.style.paddingRight = "0px";
            ag.style.width = "16px"
        } else {
            N.appendChild(document.createTextNode(I))
        }
        ag.appendChild(N);
        return ag
    } else {
        if (w.type == "large") {
            var N = document.createElement("span");
            N.className = "stLarge";
            ag.appendChild(N);
            N.style.backgroundImage = "url('" + j + t + "_32.png')";
            return ag
        } else {
            if (w.type == "basic" || w.type == "circle" || w.type == "brushed" || w.type == "shiny") {
                var N = document.createElement("span");
                N.className = "stLarge";
                N.className = w.size == "16" ? ((w.type == "brushed" || w.type == "shiny") ? "stSmall2" : "stSmall") : N.className;
                N.className = w.size == "64" ? "stHuge" : N.className;
                ag.appendChild(N);
                N.style.backgroundImage = "url('" + j + w.type + "/" + w.size + "/" + t + (w.color ? "_" + w.color : "_" + w.type) + ".png')";
                return ag
            } else {
                if (w.type == "pcount" || w.type == "stbar" || w.type == "stsmbar") {
                    var C = document.createElement("span");
                    var N = document.createElement("span");
                    if (w.type == "stsmbar") {
                        N.className = "stSmBar";
                        var j = ("https:" == document.location.protocol) ? "https://ws.sharethis.com/images/" : "http://w.sharethis.com/images/";
                        N.style.backgroundImage = "url('" + j + t + "_16.png')"
                    } else {
                        N.className = "stLarge";
                        var j = ("https:" == document.location.protocol) ? "https://ws.sharethis.com/images/" : "http://w.sharethis.com/images/";
                        N.style.backgroundImage = "url('" + j + t + "_32.png')"
                    }
                    C.appendChild(N);
                    var u = document.createElement("span");
                    var af = document.createElement("div");
                    if (w.type == "stsmbar") {
                        af.className = "stBubbleSmHoriz"
                    } else {
                        af.className = "stBubbleSm"
                    }
                    af.setAttribute("id", "stBubble_" + w.count);
                    af.style.visibility = "hidden";
                    var X = document.createElement("div");
                    X.className = "stBubble_count_sm";
                    af.appendChild(X);
                    u.appendChild(af);
                    u.appendChild(C);
                    ag.appendChild(u);
                    stButtons.getCount2(h, g, X);
                    C.onmouseover = function() {
                        var a = document.getElementById("stBubble_" + w.count);
                        a.style.visibility = "visible"
                    };
                    C.onmouseout = function() {
                        var a = document.getElementById("stBubble_" + w.count);
                        a.style.visibility = "hidden"
                    };
                    return ag
                } else {
                    if (w.type == "button" || w.type == "vcount" || w.type == "hcount") {
                        var C = document.createElement("span");
                        C.className = "stButton_gradient";
                        var J = document.createElement("span");
                        J.className = "chicklets " + g;
                        if (I == null) {
                            J.innerHTML = "&nbsp;"
                        } else {
                            J.appendChild(document.createTextNode(I))
                        }
                        C.appendChild(J);
                        if (g == "facebook" || g == "twitter" || g == "linkedin" || g == "yahoo" || g == "pinterest" || g == "sharethis" || g == "email") {
                            var v = document.createElement("span");
                            v.className = "stMainServices st-" + g + "-counter";
                            v.innerHTML = "&nbsp";
                            C = v;
                            v.style.backgroundImage = "url('" + j + t + "_counter.png')";
                            if (g == "sharethis" && I != null && I.length < 6) {
                                v.className = "stMainServices st-" + g + "-counter2";
                                v.style.backgroundImage = "url('" + j + t + "_counter2.png')"
                            }
                        }
                        if (w.type == "vcount") {
                            var u = document.createElement("div");
                            var af = document.createElement("div");
                            af.className = "stBubble";
                            var X = document.createElement("div");
                            X.className = "stBubble_count";
                            af.appendChild(X);
                            u.appendChild(af);
                            u.appendChild(C);
                            ag.appendChild(u);
                            stButtons.getCount2(h, g, X)
                        } else {
                            if (w.type == "hcount") {
                                var u = document.createElement("span");
                                var P = document.createElement("span");
                                P.className = "stButton_gradient stHBubble";
                                var r = document.createElement("span");
                                r.className = "stButton_left";
                                r.innerHTML = "&nbsp;";
                                var y = document.createElement("span");
                                y.className = "stButton_right";
                                y.innerHTML = "&nbsp;";
                                var X = document.createElement("span");
                                X.className = "stBubble_hcount";
                                P.appendChild(X);
                                u.appendChild(C);
                                var F = document.createElement("span");
                                F.className = "stArrow";
                                F.appendChild(P);
                                u.appendChild(F);
                                ag.appendChild(u);
                                stButtons.getCount2(h, g, X)
                            } else {
                                ag.appendChild(C)
                            }
                        }
                        if (w.type == "vcount" || w.type == "hcount") {
                            if (w.ctype == "native") {
                                if (g == "twitter") {
                                    var Y = document.createElement("span");
                                    Y.className = "stButton";
                                    var H = 55;
                                    var ac = 20;
                                    var T = "";
                                    var k = "none";
                                    var K = 7;
                                    if (w.type == "vcount") {
                                        var q = document.createElement("div");
                                        H = 55;
                                        ac = 62;
                                        T = "top:42px;";
                                        k = "vertical"
                                    } else {
                                        if (w.type == "hcount") {
                                            var q = document.createElement("span");
                                            H = 110;
                                            ac = 20;
                                            k = "horizontal"
                                        }
                                    }
                                    iedocmode = stlib.browser.getIEVersion();
                                    var U = document.createElement("span");
                                    U.setAttribute("style", "vertical-align:bottom;line-height:0px;position:absolute;padding:0px !important;" + T + "width:55px;height:20px;");
                                    (iedocmode && (iedocmode == 7) && U.style.setAttribute) ? U.style.setAttribute("cssText", "vertical-align:bottom;line-height:0px;position:absolute;padding:0px !important;" + T + "width:55px;height:20px;", 0): null;
                                    try {
                                        var S = document.createElement('<iframe name="stframe" allowTransparency="true" scrolling="no" frameBorder="0"></iframe>')
                                    } catch (ab) {
                                        S = document.createElement("iframe");
                                        S.setAttribute("allowTransparency", "true");
                                        S.setAttribute("frameborder", "0");
                                        S.setAttribute("scrolling", "no")
                                    }
                                    var ae = encodeURIComponent(h);
                                    S.setAttribute("src", "http://platform.twitter.com/widgets/tweet_button.html?count=" + k + "&url=" + ae);
                                    S.setAttribute("style", "width:" + H + "px;height:" + ac + "px;");
                                    (iedocmode && (iedocmode == 7) && S.style.setAttribute) ? S.style.setAttribute("cssText", "width:" + H + "px;height:" + ac + "px;", 0): null;
                                    if ((useFastShare && servicesLoggedIn && typeof(servicesLoggedIn[g]) != "undefined")) {
                                        q.appendChild(U)
                                    }
                                    q.appendChild(S);
                                    C = q;
                                    Y.appendChild(C);
                                    Y.setAttribute("style", "text-decoration:none;color:#000000;display:inline-block;cursor:pointer;vertical-align:bottom;margin-top:6px;width:" + H + "px;height:" + ac + "px;");
                                    (iedocmode && (iedocmode == 7) && Y.style.setAttribute) ? Y.style.setAttribute("cssText", "text-decoration:none;color:#000000;display:inline-block;cursor:pointer;vertical-align:bottom;width:" + H + "px;height:" + ac + "px;", 0): null;
                                    ag = Y
                                } else {
                                    if (g == "facebook") {
                                        stButtons.getXFBMLFromFB(w);
                                        return stButtons.makeFBButton("fblike", w.type, h)
                                    } else {
                                        if (g == "linkedin") {}
                                    }
                                }
                            }
                        }
                    } else {
                        if (w.type == "css") {
                            var C = document.createElement("div");
                            C.className = "stCSSButton";
                            if (w.cssType == "cssV") {
                                var B = document.createElement("div");
                                B.className = "stCSSVBubble";
                                var M = document.createElement("div");
                                M.className = "stCSSVBubble_count";
                                B.appendChild(M);
                                var m = document.createElement("div");
                                m.className = "stCSSVArrow";
                                var R = document.createElement("div");
                                R.className = "stCSSVArrowBorder";
                                R.appendChild(m);
                                ag.appendChild(B);
                                ag.appendChild(R);
                                stButtons.getCount2(h, g, M)
                            }
                            var d = document.createElement("div");
                            d.className = "stCSSSprite " + g;
                            d.innerHTML = "&nbsp;";
                            var N = document.createElement("span");
                            N.className = "stCSSText";
                            C.appendChild(d);
                            if (I == null || I == "") {} else {
                                N.appendChild(document.createTextNode(I));
                                C.appendChild(N)
                            }
                            ag.appendChild(C);
                            if (w.cssType == "cssH") {
                                var A = document.createElement("div");
                                A.className = "stCSSHBubble";
                                var M = document.createElement("div");
                                M.className = "stCSSHBubble_count";
                                A.appendChild(M);
                                var ad = document.createElement("div");
                                ad.className = "stCSSHArrow";
                                var p = document.createElement("div");
                                p.className = "stCSSHArrowBorder";
                                p.appendChild(ad);
                                ag.appendChild(p);
                                ag.appendChild(A);
                                stButtons.getCount2(h, g, M)
                            }
                        }
                    }
                }
            }
        }
    }
    return ag
};
stButtons.makeFBButton = function(j, l, b) {
    try {
        var i = document.createElement("<div></div>")
    } catch (e) {
        i = document.createElement("div")
    }
    if ((/#sthash/i).test(b)) {
        var m = b.split("#");
        if (m.length > 0) {
            b = m[0]
        }
    }
    var d = b;
    var h = "button_count";
    var k = "fb-send";
    var f = "";
    iedocmode = stlib.browser.getIEVersion();
    var g = "";
    if (l == "vcount") {
        h = "box_count"
    } else {
        if (l == "hcount") {} else {
            if (l == "large") {
                g = (iedocmode && (iedocmode == 7)) ? "vertical-align:bottom;bottom:3px;" : "bottom:7px;margin-top:9px;"
            } else {
                if (l == "button") {} else {
                    g = "top:1px;margin-top:0px;"
                }
            }
        }
    }
    if (j == "fbLong") {
        k = "fb-like";
        h = "standard";
        i.setAttribute("data-layout", h);
        i.setAttribute("data-send", "false");
        i.setAttribute("data-show-faces", "false")
    } else {
        if (j == "fbsend") {
            k = "fb-send"
        } else {
            if (j == "fblike" || j == "fbrec") {
                (j == "fbrec") ? f = "recommend": null;
                k = "fb-like";
                i.setAttribute("data-action", f);
                i.setAttribute("data-send", "false");
                i.setAttribute("data-layout", h);
                i.setAttribute("data-show-faces", "false")
            } else {
                if (j == "fbsub") {
                    k = "fb-subscribe";
                    i.setAttribute("data-layout", h);
                    i.setAttribute("data-show-faces", "false")
                }
            }
        }
    }
    i.setAttribute("class", k);
    i.setAttribute("data-href", d);
    if (iedocmode && (iedocmode == 7)) {
        if (j != "fbsend") {
            i = document.createElement("<div class='" + k + "' data-action='" + f + "' data-send='false' data-layout='" + h + "' data-show-faces='false' data-href='" + d + "'></div>")
        } else {
            i = document.createElement("<div class='" + k + "' data-href='" + d + "'></div>")
        }
    }
    var a = document.createElement("span");
    a.setAttribute("style", "text-decoration:none;color:#000000;display:inline-block;cursor:pointer;position:relative;margin:3px 3px 0;padding:0px;font-size:11px;line-height:0px;vertical-align:bottom;overflow:visible;" + g);
    (iedocmode && (iedocmode == 7) && a.style.setAttribute) ? a.style.setAttribute("cssText", "text-decoration:none;color:#000000;display:inline-block;cursor:pointer;position:relative;margin:3px 3px 0;font-size:11px;line-height:0px;" + g, 0): (null);
    a.appendChild(i);
    return a
};
stButtons.getCount = function(d, a, e) {
    var b = false;
    if (e && e !== null) {
        while (e.childNodes.length >= 1) {
            try {
                e.removeChild(e.firstChild)
            } catch (f) {}
        }
    }
    stButtons.cbQueue.push({
        url: d,
        service: a,
        element: e
    });
    stButtons.getCountsFromService(d, a, e)
};
stButtons.getCount2 = function(d, a, e) {
    var b = false;
    if (e && e !== null) {
        while (e.childNodes.length >= 1) {
            try {
                e.removeChild(e.firstChild)
            } catch (f) {}
        }
    }
    if (stWidget.options.nativeCount && stlib.nativeCounts.checkNativeCountServicesQueue(a)) {
        if (a == "facebook") {
            if ((/#/).test(d)) {
                d = d.split("#")[0]
            }
        }
        stButtons.cbNativeQueue.push({
            url: d,
            service: a,
            element: e
        });
        if (typeof(stButtons.countsNativeResp[d]) == "undefined") {
            stButtons.countsNativeResp[d] = []
        }
        if (typeof(stButtons.countsNativeResp[d][a]) == "undefined") {
            stlib.nativeCounts.getNativeCounts(a, d, "stButtons." + a + "CB");
            stButtons.countsNativeResp[d][a] = null
        } else {
            if (stButtons.countsNativeResp[d][a] != null) {
                switch (a) {
                    case "facebook":
                        stButtons.facebookCB(stButtons.countsNativeResp[d][a]);
                        break;
                    case "linkedin":
                        stButtons.linkedinCB(stButtons.countsNativeResp[d][a]);
                        break;
                    case "stumbleupon":
                        stButtons.stumbleuponCB(stButtons.countsNativeResp[d][a]);
                        break
                }
            }
        }
    } else {
        stButtons.cbQueue.push({
            url: d,
            service: a,
            element: e
        });
        stButtons.getCountsFromService(d, a, e)
    }
};
stButtons.processCB = function(a) {
    if (typeof(a) != "undefined" && typeof(a.ourl) != "undefined") {
        stButtons.countsResp[a.ourl] = a
    }
    stButtons.processCount(a)
};
stButtons.stumbleuponCB = function(a) {
    var b = {
        ourl: "",
        stumbleupon: null
    };
    if (typeof(a) != "undefined" && typeof(a.result) != "undefined") {
        if (typeof(stButtons.countsNativeResp[a.result.url]) != "undefined") {
            stButtons.countsNativeResp[a.result.url]["stumbleupon"] = a
        }
        b.ourl = a.result.url;
        if (typeof(a.result.views) != "undefined") {
            b.stumbleupon = a.result.views
        }
    }
    stButtons.processNativeCount(b, "stumbleupon")
};
stButtons.linkedinCB = function(a) {
    var b = {
        ourl: "",
        linkedin: null
    };
    if (typeof(a) != "undefined") {
        if (typeof(stButtons.countsNativeResp[a.url]) != "undefined") {
            stButtons.countsNativeResp[a.url]["linkedin"] = a
        }
        b.ourl = a.url;
        if (typeof(a.count) != "undefined") {
            b.linkedin = a.count
        }
    }
    stButtons.processNativeCount(b, "linkedin")
};
stButtons.facebookCB = function(a) {
    var b = {
        ourl: "",
        facebook: null
    };
    if (typeof(a) != "undefined") {
        if (typeof(stButtons.countsNativeResp[a[0].url]) != "undefined") {
            stButtons.countsNativeResp[a[0].url]["facebook"] = a
        }
        b.ourl = a[0].url;
        if (typeof(a[0].total_count) != "undefined") {
            b.facebook = a[0].total_count
        }
    }
    stButtons.processNativeCount(b, "facebook")
};
stButtons.processCount = function(b) {
    if (!(b)) {
        return
    }
    stButtons.storedCountResponse = b;
    var a = false;
    for (var d = 0; d < stButtons.cbQueue.length; d++) {
        var f = stButtons.cbQueue[d];
        if (b.ourl == f.url) {
            var h = "New";
            try {
                if (f.service == "sharethis") {
                    if (stWidget.options.minShareCount == null || b.total >= stWidget.options.minShareCount) {
                        if (stWidget.options.newOrZero == "zero") {
                            h = (b.total > 0) ? stButtons.human(b.total) : "0"
                        } else {
                            h = (b.total > 0) ? stButtons.human(b.total) : "New"
                        }
                    }
                } else {
                    if (f.service == "facebook" && typeof(b.facebook2) != "undefined") {
                        if (stWidget.options.minShareCount == null || b.facebook2 >= stWidget.options.minShareCount) {
                            h = stButtons.human(b.facebook2)
                        }
                    } else {
                        if (typeof(b[f.service]) != "undefined") {
                            if (stWidget.options.minShareCount == null || b[f.service] >= stWidget.options.minShareCount) {
                                h = (b[f.service] > 0) ? stButtons.human(b[f.service]) : "0"
                            }
                        } else {
                            if (stWidget.options.minShareCount == null || stWidget.options.minShareCount <= 0) {
                                h = "0"
                            }
                        }
                    }
                }
                if (/stHBubble/.test(f.element.parentNode.className) == true) {
                    f.element.parentNode.style.display = "inline-block"
                } else {
                    if (/stBubble/.test(f.element.parentNode.className) == true) {
                        f.element.parentNode.style.display = "block"
                    }
                }
                f.element.innerHTML = h
            } catch (e) {
                if (!f.element.hasChildNodes()) {
                    var g = document.createElement("div");
                    g.innerHTML = h;
                    f.element.appendChild(g)
                }
            }
            a = true
        }
    }
};
stButtons.processNativeCount = function(b, a) {
    if (!(b)) {
        return
    }
    if (!(a)) {
        return
    }
    for (var d = 0; d < stButtons.cbNativeQueue.length; d++) {
        var f = stButtons.cbNativeQueue[d];
        if (b.ourl == f.url || (a == "stumbleupon" && b.ourl.replace(/http:\/\/www\.|http:\/\/|www\./i, "") == f.url.replace(/http:\/\/www\.|http:\/\/|www\./i, ""))) {
            var h = "New";
            try {
                if (f.service == a) {
                    if (b[a] != null) {
                        if (stWidget.options.minShareCount == null || b[a] >= stWidget.options.minShareCount) {
                            h = stButtons.human(b[a])
                        }
                    }
                } else {
                    continue
                }
                if (/stHBubble/.test(f.element.parentNode.className) == true) {
                    f.element.parentNode.style.display = "inline-block"
                } else {
                    if (/stBubble/.test(f.element.parentNode.className) == true) {
                        f.element.parentNode.style.display = "block"
                    }
                }
                f.element.innerHTML = h
            } catch (e) {
                if (!f.element.hasChildNodes()) {
                    var g = document.createElement("div");
                    g.innerHTML = h;
                    f.element.appendChild(g)
                }
            }
        }
    }
};
stButtons.human = function(a) {
    if (a >= 100000) {
        a = a / 1000;
        a = Math.round(a);
        a = a + "K"
    } else {
        if (a >= 10000) {
            a = a / 100;
            a = Math.round(a);
            a = a / 10;
            a = a + "K"
        }
    }
    return a
};
stButtons.isValidService = function(a) {
    return (typeof(stlib.allServices) === "object" && stlib.allServices.hasOwnProperty(a)) ? true : (typeof(stlib.allOauthServices) === "object" && stlib.allOauthServices.hasOwnProperty(a)) ? true : (typeof(stlib.allNativeServices) === "object" && stlib.allNativeServices.hasOwnProperty(a)) ? true : (typeof(stlib.allOtherServices) === "object" && stlib.allOtherServices.hasOwnProperty(a)) ? true : false
};
stButtons.locateElements = function(d) {
    var v = document.getElementsByTagName("*");
    var o = [];
    var P = new RegExp(/st_(.*?)_custom/);
    var O = new RegExp(/st_(.*?)_vcount/);
    var w = new RegExp(/st_(.*?)_vcount_native/);
    var N = new RegExp(/st_(.*?)_hcount/);
    var n = new RegExp(/st_(.*?)_hcount_native/);
    var M = new RegExp(/st_(.*?)_button/);
    var L = new RegExp(/st_(.*?)_large/);
    var J = new RegExp(/st_(.*?)_pcount/);
    var I = new RegExp(/st_(.*?)_stbar/);
    var F = new RegExp(/st_(.*?)_stsmbar/);
    var E = new RegExp(/st_(.*?)_css/);
    var u = new RegExp(/^st_(.*?)$/);
    var h = new RegExp(/st_(.*?)_basic/);
    var p = new RegExp(/st_(.*?)_circle/);
    var l = new RegExp(/(st_(.*?)_basic)|(st_(.*?)_circle)/);
    var e = new RegExp(/(st_(.*?)_brushed)|(st_(.*?)_shiny)/);
    var C = new RegExp(/(st_(.*?)_brushed)/);
    var Q = new RegExp(/(st_(.*?)_shiny)/);
    var g = v.length;
    var A = 0,
        B, m, j, a = [],
        t = false;
    if (typeof(stRecentServices) != "undefined" && stRecentServices != "undefined" && stRecentServices != "false" && stRecentServices) {
        t = true
    }
    for (var D = 0; D < g; D++) {
        B = "";
        m = false;
        j = false;
        if (typeof(v[D].className) == "string" && v[D].className != "") {
            if (!stlib.browser.mobile.isIOs() && (v[D].className.indexOf("whatsapp") !== -1 && window.location.pathname.indexOf("get-sharing-tools") === -1)) {
                continue
            }
            if (v[D].className.match(P) && v[D].className.match(P).length >= 2 && v[D].className.match(P)[1]) {
                if (stButtons.testElem(v[D]) == false) {
                    j = true;
                    B = v[D].className.match(P)[1];
                    typeName = "custom";
                    if (B == "plusone" || B == "fblike" || B == "fbrec" || B == "fbsend" || B == "fbsub") {
                        typeName = "chicklet"
                    }
                    o.push({
                        service: B,
                        element: v[D],
                        url: v[D].getAttribute("st_url"),
                        short_url: (v[D].getAttribute("st_short_url") != null) ? v[D].getAttribute("st_short_url") : "",
                        title: v[D].getAttribute("st_title"),
                        image: (v[D].getAttribute("st_img") != null) ? v[D].getAttribute("st_img") : v[D].getAttribute("st_image"),
                        pinterest_native: v[D].getAttribute("st_native"),
                        message: (v[D].getAttribute("st_msg") != null) ? v[D].getAttribute("st_msg") : v[D].getAttribute("st_message"),
                        summary: v[D].getAttribute("st_summary"),
                        text: v[D].getAttribute("displayText"),
                        type: typeName
                    });
                    v[D].setAttribute("st_processed", "yes")
                }
            } else {
                if (v[D].className.match(l) && v[D].className.match(l).length >= 2) {
                    if (stButtons.testElem(v[D]) == false) {
                        j = true;
                        B = v[D].className.split("_")[1];
                        var R = "basic";
                        if (v[D].className.match(p)) {
                            R = "circle"
                        }
                        o.push({
                            service: B,
                            element: v[D],
                            url: v[D].getAttribute("st_url"),
                            short_url: (v[D].getAttribute("st_short_url") != null) ? v[D].getAttribute("st_short_url") : "",
                            title: v[D].getAttribute("st_title"),
                            image: (v[D].getAttribute("st_img") != null) ? v[D].getAttribute("st_img") : v[D].getAttribute("st_image"),
                            pinterest_native: v[D].getAttribute("st_native"),
                            message: (v[D].getAttribute("st_msg") != null) ? v[D].getAttribute("st_msg") : v[D].getAttribute("st_message"),
                            summary: v[D].getAttribute("st_summary"),
                            text: v[D].getAttribute("displayText"),
                            type: R,
                            size: v[D].className.split("$")[1],
                            color: v[D].className.split("$")[2]
                        });
                        v[D].setAttribute("st_processed", "yes")
                    }
                } else {
                    if (v[D].className.match(e) && v[D].className.match(e).length >= 2) {
                        if (stButtons.testElem(v[D]) == false) {
                            j = true;
                            B = v[D].className.split("_")[1];
                            var R = "brushed";
                            if (v[D].className.match(Q)) {
                                R = "shiny"
                            }
                            o.push({
                                service: B,
                                element: v[D],
                                url: v[D].getAttribute("st_url"),
                                short_url: (v[D].getAttribute("st_short_url") != null) ? v[D].getAttribute("st_short_url") : "",
                                title: v[D].getAttribute("st_title"),
                                image: (v[D].getAttribute("st_img") != null) ? v[D].getAttribute("st_img") : v[D].getAttribute("st_image"),
                                pinterest_native: v[D].getAttribute("st_native"),
                                message: (v[D].getAttribute("st_msg") != null) ? v[D].getAttribute("st_msg") : v[D].getAttribute("st_message"),
                                summary: v[D].getAttribute("st_summary"),
                                text: v[D].getAttribute("displayText"),
                                type: R,
                                size: v[D].className.split("$")[1]
                            });
                            v[D].setAttribute("st_processed", "yes")
                        }
                    } else {
                        if (v[D].className.match(O) && v[D].className.match(O).length >= 2 && v[D].className.match(O)[1]) {
                            if (stButtons.testElem(v[D]) == false) {
                                j = true;
                                B = v[D].className.match(O)[1];
                                var G = "";
                                if (v[D].className.match(w) && v[D].className.match(w).length >= 2 && v[D].className.match(w)[1]) {
                                    G = "native"
                                }
                                o.push({
                                    service: B,
                                    element: v[D],
                                    url: v[D].getAttribute("st_url"),
                                    short_url: (v[D].getAttribute("st_short_url") != null) ? v[D].getAttribute("st_short_url") : "",
                                    title: v[D].getAttribute("st_title"),
                                    image: (v[D].getAttribute("st_img") != null) ? v[D].getAttribute("st_img") : v[D].getAttribute("st_image"),
                                    pinterest_native: v[D].getAttribute("st_native"),
                                    message: (v[D].getAttribute("st_msg") != null) ? v[D].getAttribute("st_msg") : v[D].getAttribute("st_message"),
                                    summary: v[D].getAttribute("st_summary"),
                                    text: v[D].getAttribute("displayText"),
                                    type: "vcount",
                                    ctype: G
                                });
                                v[D].setAttribute("st_processed", "yes")
                            }
                        } else {
                            if (v[D].className.match(N) && v[D].className.match(N).length >= 2 && v[D].className.match(N)[1]) {
                                if (stButtons.testElem(v[D]) == false) {
                                    j = true;
                                    B = v[D].className.match(N)[1];
                                    var G = "";
                                    if (v[D].className.match(n) && v[D].className.match(n).length >= 2 && v[D].className.match(n)[1]) {
                                        G = "native"
                                    }
                                    o.push({
                                        service: B,
                                        element: v[D],
                                        url: v[D].getAttribute("st_url"),
                                        short_url: (v[D].getAttribute("st_short_url") != null) ? v[D].getAttribute("st_short_url") : "",
                                        title: v[D].getAttribute("st_title"),
                                        image: (v[D].getAttribute("st_img") != null) ? v[D].getAttribute("st_img") : v[D].getAttribute("st_image"),
                                        pinterest_native: v[D].getAttribute("st_native"),
                                        message: (v[D].getAttribute("st_msg") != null) ? v[D].getAttribute("st_msg") : v[D].getAttribute("st_message"),
                                        summary: v[D].getAttribute("st_summary"),
                                        text: v[D].getAttribute("displayText"),
                                        type: "hcount",
                                        ctype: G
                                    });
                                    v[D].setAttribute("st_processed", "yes")
                                }
                            } else {
                                if (v[D].className.match(M) && v[D].className.match(M).length >= 2 && v[D].className.match(M)[1]) {
                                    if (stButtons.testElem(v[D]) == false) {
                                        j = true;
                                        B = v[D].className.match(M)[1];
                                        o.push({
                                            service: B,
                                            element: v[D],
                                            url: v[D].getAttribute("st_url"),
                                            short_url: (v[D].getAttribute("st_short_url") != null) ? v[D].getAttribute("st_short_url") : "",
                                            title: v[D].getAttribute("st_title"),
                                            image: (v[D].getAttribute("st_img") != null) ? v[D].getAttribute("st_img") : v[D].getAttribute("st_image"),
                                            pinterest_native: v[D].getAttribute("st_native"),
                                            message: (v[D].getAttribute("st_msg") != null) ? v[D].getAttribute("st_msg") : v[D].getAttribute("st_message"),
                                            summary: v[D].getAttribute("st_summary"),
                                            text: v[D].getAttribute("displayText"),
                                            type: "button"
                                        });
                                        v[D].setAttribute("st_processed", "yes")
                                    }
                                } else {
                                    if (v[D].className.match(L) && v[D].className.match(L).length >= 2 && v[D].className.match(L)[1]) {
                                        if (stButtons.testElem(v[D]) == false) {
                                            j = true;
                                            B = v[D].className.match(L)[1];
                                            o.push({
                                                service: B,
                                                element: v[D],
                                                url: v[D].getAttribute("st_url"),
                                                short_url: (v[D].getAttribute("st_short_url") != null) ? v[D].getAttribute("st_short_url") : "",
                                                title: v[D].getAttribute("st_title"),
                                                image: (v[D].getAttribute("st_img") != null) ? v[D].getAttribute("st_img") : v[D].getAttribute("st_image"),
                                                pinterest_native: v[D].getAttribute("st_native"),
                                                message: (v[D].getAttribute("st_msg") != null) ? v[D].getAttribute("st_msg") : v[D].getAttribute("st_message"),
                                                summary: v[D].getAttribute("st_summary"),
                                                text: v[D].getAttribute("displayText"),
                                                type: "large"
                                            });
                                            v[D].setAttribute("st_processed", "yes")
                                        }
                                    } else {
                                        if (v[D].className.match(J) && v[D].className.match(J).length >= 2 && v[D].className.match(J)[1]) {
                                            if (stButtons.testElem(v[D]) == false) {
                                                j = true;
                                                B = v[D].className.match(J)[1];
                                                o.push({
                                                    service: B,
                                                    element: v[D],
                                                    url: v[D].getAttribute("st_url"),
                                                    short_url: (v[D].getAttribute("st_short_url") != null) ? v[D].getAttribute("st_short_url") : "",
                                                    title: v[D].getAttribute("st_title"),
                                                    image: (v[D].getAttribute("st_img") != null) ? v[D].getAttribute("st_img") : v[D].getAttribute("st_image"),
                                                    pinterest_native: v[D].getAttribute("st_native"),
                                                    message: (v[D].getAttribute("st_msg") != null) ? v[D].getAttribute("st_msg") : v[D].getAttribute("st_message"),
                                                    summary: v[D].getAttribute("st_summary"),
                                                    text: v[D].getAttribute("displayText"),
                                                    type: "pcount",
                                                    count: D
                                                });
                                                v[D].setAttribute("st_processed", "yes")
                                            }
                                        } else {
                                            if (v[D].className.match(I) && v[D].className.match(I).length >= 2 && v[D].className.match(I)[1]) {
                                                if (stButtons.testElem(v[D]) == false) {
                                                    j = true;
                                                    B = v[D].className.match(I)[1];
                                                    o.push({
                                                        service: B,
                                                        element: v[D],
                                                        url: v[D].getAttribute("st_url"),
                                                        short_url: (v[D].getAttribute("st_short_url") != null) ? v[D].getAttribute("st_short_url") : "",
                                                        title: v[D].getAttribute("st_title"),
                                                        image: (v[D].getAttribute("st_img") != null) ? v[D].getAttribute("st_img") : v[D].getAttribute("st_image"),
                                                        pinterest_native: v[D].getAttribute("st_native"),
                                                        message: (v[D].getAttribute("st_msg") != null) ? v[D].getAttribute("st_msg") : v[D].getAttribute("st_message"),
                                                        summary: v[D].getAttribute("st_summary"),
                                                        text: v[D].getAttribute("displayText"),
                                                        type: "stbar",
                                                        count: D
                                                    });
                                                    v[D].setAttribute("st_processed", "yes")
                                                }
                                            } else {
                                                if (v[D].className.match(F) && v[D].className.match(F).length >= 2 && v[D].className.match(F)[1]) {
                                                    if (stButtons.testElem(v[D]) == false) {
                                                        j = true;
                                                        B = v[D].className.match(F)[1];
                                                        o.push({
                                                            service: B,
                                                            element: v[D],
                                                            url: v[D].getAttribute("st_url"),
                                                            short_url: (v[D].getAttribute("st_short_url") != null) ? v[D].getAttribute("st_short_url") : "",
                                                            title: v[D].getAttribute("st_title"),
                                                            image: (v[D].getAttribute("st_img") != null) ? v[D].getAttribute("st_img") : v[D].getAttribute("st_image"),
                                                            pinterest_native: v[D].getAttribute("st_native"),
                                                            message: (v[D].getAttribute("st_msg") != null) ? v[D].getAttribute("st_msg") : v[D].getAttribute("st_message"),
                                                            summary: v[D].getAttribute("st_summary"),
                                                            text: v[D].getAttribute("displayText"),
                                                            type: "stsmbar",
                                                            count: D
                                                        });
                                                        v[D].setAttribute("st_processed", "yes")
                                                    }
                                                } else {
                                                    if (v[D].className.match(E) && v[D].className.match(E).length >= 2 && v[D].className.match(E)[1]) {
                                                        if (stButtons.testElem(v[D]) == false) {
                                                            j = true;
                                                            B = v[D].className.match(E)[1];
                                                            var H = v[D].className.split("_");
                                                            o.push({
                                                                service: B,
                                                                element: v[D],
                                                                url: v[D].getAttribute("st_url"),
                                                                short_url: (v[D].getAttribute("st_short_url") != null) ? v[D].getAttribute("st_short_url") : "",
                                                                title: v[D].getAttribute("st_title"),
                                                                image: (v[D].getAttribute("st_img") != null) ? v[D].getAttribute("st_img") : v[D].getAttribute("st_image"),
                                                                pinterest_native: v[D].getAttribute("st_native"),
                                                                message: (v[D].getAttribute("st_msg") != null) ? v[D].getAttribute("st_msg") : v[D].getAttribute("st_message"),
                                                                summary: v[D].getAttribute("st_summary"),
                                                                text: v[D].getAttribute("displayText"),
                                                                type: "css",
                                                                cssType: H[H.length - 1]
                                                            });
                                                            v[D].setAttribute("st_processed", "yes")
                                                        }
                                                    } else {
                                                        if (v[D].className.match(u) && v[D].className.match(u).length >= 2 && v[D].className.match(u)[1]) {
                                                            if (stButtons.testElem(v[D]) == false) {
                                                                j = true;
                                                                B = v[D].className.match(u)[1];
                                                                o.push({
                                                                    service: B,
                                                                    element: v[D],
                                                                    url: v[D].getAttribute("st_url"),
                                                                    short_url: (v[D].getAttribute("st_short_url") != null) ? v[D].getAttribute("st_short_url") : "",
                                                                    title: v[D].getAttribute("st_title"),
                                                                    image: (v[D].getAttribute("st_img") != null) ? v[D].getAttribute("st_img") : v[D].getAttribute("st_image"),
                                                                    pinterest_native: v[D].getAttribute("st_native"),
                                                                    message: (v[D].getAttribute("st_msg") != null) ? v[D].getAttribute("st_msg") : v[D].getAttribute("st_message"),
                                                                    summary: v[D].getAttribute("st_summary"),
                                                                    text: v[D].getAttribute("displayText"),
                                                                    type: "chicklet"
                                                                });
                                                                v[D].setAttribute("st_processed", "yes")
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (t) {
                if (j) {
                    for (A = 0; A < a.length; A++) {
                        if (a[A].service == B) {
                            a[A].count++;
                            m = true
                        }
                    }
                    if (!m) {
                        a.push({
                            service: B,
                            count: 1,
                            doNotReplace: false,
                            processed: false
                        })
                    }
                }
            }
        }
    }
    if (t) {
        var K = [];
        for (var s = a.length - 1; s >= 0; s--) {
            if (a[s].service == "sharethis" || a[s].doNotReplace) {
                a[s].processed = true;
                continue
            } else {
                for (var r in stRecentServices) {
                    var f = false;
                    if (!stRecentServices[r].processed) {
                        for (var b = 0; b < a.length; b++) {
                            if (r == a[b].service && !a[b].processed) {
                                f = true;
                                a[b].doNotReplace = true;
                                stRecentServices[r].processed = true;
                                break
                            }
                        }
                        if (f) {
                            a[s].processed = true
                        } else {
                            K.push({
                                oldService: a[s].service,
                                newService: r
                            });
                            for (var q = 0; q < o.length; q++) {
                                if (o[q].service == a[s].service) {
                                    o[q].service = r;
                                    o[q].text = stRecentServices[r].title;
                                    o[q].element.setAttribute("displayText", stRecentServices[r].title);
                                    o[q].element.className = o[q].element.className.replace(a[s].service, r)
                                }
                            }
                            stRecentServices[r].processed = true;
                            a[s].processed = true;
                            break
                        }
                    }
                }
            }
        }
    }
    for (var D = 0; D < o.length; D++) {
        if (!stButtons.isValidService(o[D].service)) {
            continue
        }
        stWidget.addEntry(o[D])
    }
};
stButtons.odcss = function(a, b) {
    this.head = document.getElementsByTagName("head")[0];
    this.scriptSrc = a;
    this.css = document.createElement("link");
    this.css.setAttribute("rel", "stylesheet");
    this.css.setAttribute("type", "text/css");
    this.css.setAttribute("href", this.scriptSrc);
    setTimeout(function() {
        b()
    }, 500);
    this.head.appendChild(this.css)
};
stButtons.makeButtons = function() {
    if (typeof(stButtons.button_css_called) == "undefined") {
        var a = (("https:" == document.location.protocol) ? "https://ws.sharethis.com/button/css/buttons-secure.css" : "http://w.sharethis.com/button/css/buttons.87ccd3b7cff586d3f8cd8ce62998d290.css");
        stButtons.odcss(a, function() {});
        stButtons.button_css_called = true
    }
    stButtons.locateElements()
};
stButtons.getPlusOneFromGoogle = function(a) {
    if (stButtons.plusOneLoaded == false) {
        if (stButtons.plusOneLoading == false) {
            var b = document.createElement("script");
            b.setAttribute("type", "text/javascript");
            b.setAttribute("src", "https://apis.google.com/js/plusone.js");
            b.async = stWidget.options.asyncPlusone;
            b.onload = function() {
                stButtons.renderPlusOneFromGoogle(a);
                stButtons.plusOneLoaded = true;
                stButtons.plusOneLoading = false
            };
            b.onreadystatechange = function() {
                if (this.readyState == "complete") {
                    stButtons.renderPlusOneFromGoogle(a);
                    stButtons.plusOneLoaded = true;
                    stButtons.plusOneLoading = false
                }
            };
            stButtons.plusOneLoading = true;
            document.getElementsByTagName("head")[0].appendChild(b)
        }
    } else {
        stButtons.renderPlusOneFromGoogle(a)
    }
};
stButtons.renderPlusOneFromGoogle = function(a) {
    if (a == "plusone") {
        gapi.plusone.go()
    } else {
        if (a == "googleplusfollow" || a == "googleplusadd") {
            gapi.plus.go()
        }
    }
};
stButtons.getXFBMLFromFB = function(b) {
    if (typeof(stWidget.options.fbLoad) != "undefined" && stWidget.options.fbLoad != true) {
        return
    }
    if (stButtons.xfbmlLoaded == false) {
        if (stButtons.xfbmlLoading == false) {
            stButtons.xfbmlLoading = true;
            var d = document.createElement("div");
            d.setAttribute("id", "fb-root");
            document.body.appendChild(d);
            var a = "en_US";
            if (typeof(stWidget.options.fbLang) != "undefined" && stWidget.options.fbLang != "") {
                a = stWidget.options.fbLang
            }
            var f, e = document.getElementsByTagName("script")[0];
            if (document.getElementById("facebook-jssdk")) {
                if (typeof(FB) != "undefined" && typeof(FB.XFBML) != "undefined" && typeof(FB.XFBML.parse) == "function") {
                    if (!(/iframe/).test(b.innerHTML)) {
                        FB.XFBML.parse(b)
                    }
                    stButtons.trackFB();
                    stButtons.xfbmlLoaded = true;
                    stButtons.xfbmlLoading = false
                }
                return
            }
            f = document.createElement("script");
            f.id = "facebook-jssdk";
            f.src = "//connect.facebook.net/" + a + "/sdk.js#version=v2.0";
            f.async = stWidget.options.async;
            f.onload = function() {
                FB.init({
                    appId: "",
                    xfbml: true,
                    version: "v2.0"
                });
                stButtons.trackFB();
                stButtons.xfbmlLoaded = true;
                stButtons.xfbmlLoading = false
            };
            f.onreadystatechange = function() {
                if (this.readyState == "complete" || this.readyState == "loaded") {
                    FB.init({
                        appId: "",
                        xfbml: true,
                        version: "v2.0"
                    });
                    stButtons.trackFB();
                    stButtons.xfbmlLoaded = true;
                    stButtons.xfbmlLoading = false
                }
            };
            e.parentNode.insertBefore(f, e)
        }
    } else {
        if (!(/iframe/).test(b.innerHTML)) {
            FB.XFBML.parse(b)
        }
        stButtons.trackFB()
    }
};
stButtons.addCount = function(a) {
    stButtons.counts.push(a)
};
stButtons.getCountsFromService = function(a, h, f) {
    if (stButtons.checkQueue(a) == false) {
        var d = d + "-" + stButtons.cbVal;
        d = "stButtons.processCB";
        stButtons.cbVal++;
        var j = document.referrer;
        var e = j.replace("http://", "").replace("https://", "").split("/");
        var i = e.shift();
        var b = e.join("/");
        i = encodeURIComponent(i);
        b = encodeURIComponent(b);
        var g = stLight.publisher;
        var k = (("https:" == document.location.protocol) ? "https://ws.sharethis.com/api/getCount2.php?cb=" + d + "&refDomain=" + i + "&refQuery=" + b + "&pgurl=" + encodeURIComponent(document.location.href) + "&pubKey=" + g + "&url=" : "http://wd.sharethis.com/api/getCount2.php?cb=" + d + "&refDomain=" + i + "&refQuery=" + b + "&pgurl=" + encodeURIComponent(document.location.href) + "&pubKey=" + g + "&url=");
        stLight.odjs(k + encodeURIComponent(a), function() {});
        stButtons.queue.push(a)
    }
    if (stButtons.countsResp[a]) {
        stButtons.processCount(stButtons.countsResp[a])
    }
};
stButtons.checkQueue = function(a) {
    for (var b = 0; b < stButtons.queue.length; b++) {
        if (stButtons.queue[b] == a) {
            return true
        }
    }
    return false
};
stButtons.testElem = function(b) {
    var a = false;
    if (b.getAttribute("st_processed") != null) {
        return true
    } else {
        return false
    }
};

function Shareable(d) {
    var a = {};
    a.facebook = "450";
    a.twitter = "684";
    a.yahoo = "500";
    a.linkedin = "600";
    var b = {};
    b.facebook = "300";
    b.twitter = "718";
    b.yahoo = "460";
    b.linkedin = "433";
    this.idx = -1;
    this.url = null;
    this.short_url = null;
    this.title = null;
    this.image = null;
    this.pinterest_native = null;
    this.element = null;
    this.service = null;
    this.message = null;
    this.screen = "home";
    this.summary = null;
    this.content = null;
    this.buttonText = null;
    this.frag = null;
    this.onhover = true;
    this.type = null;
    var e = this;
    var f = false;
    this.attachButton = function(g) {
        this.element = g;
        if ((this.onhover == true || this.onhover == "true") && !stlib.browser.mobile.isMobile() && ((stWidgetVersion == "4x") || ((stWidgetVersion == "5xa") && (d.service == "sharethis" || d.service == "email" || d.service == "wordpress")))) {
            g.onmouseover = this.mouseOn;
            g.onmouseout = this.mouseOut
        }
        g.onclick = function(h) {
            e.decideFastShare()
        }
    };
    this.init = function() {
        stWidget.merge(this, d);
        stWidget.shareables.push(this);
        if (d.element !== null) {
            this.attachButton(d.element)
        }
    };
    return this
}
if (typeof(stWidget) == "undefined") {
    var stWidget = new function() {
        this.shareables = [];
        this.entries = 0;
        this.widgetOpen = false;
        this.mouseOnTimer = null;
        this.mouseTimer = null;
        this.mouseOutTimer = null;
        this.frameReady = false;
        this.stopClosing = false;
        this.buttonClicked = false;
        this.widgetLoadingComplete = false;
        this.skipESIValue = false;
        this.frameUrl5xa = this.frameUrl5x = (("https:" == document.location.protocol) ? "https://ws.sharethis.com/secure5x/index.html" : "http://edge.sharethis.com/share5x/index.53123d14fa98b284409a6b2d7bb67367.html");
        this.frameUrl4x = (("https:" == document.location.protocol) ? "https://ws.sharethis.com/secure/index.html" : "http://edge.sharethis.com/share4x/index.2640f546b26921ded1d6669f56a3dbe6.html");
        this.secure = false;
        try {
            this.mainstframe = document.createElement('<iframe name="stLframe" allowTransparency="true" style="body{background:transparent;}" ></iframe>');
            this.mainstframe.onreadystatechange = function() {
                if (stWidget.mainstframe.readyState === "complete") {
                    stWidget.frameReady = true;
                    stButtons.pumpInstance = new stlib.pump(stWidget.mainstframe, stWidget.mainstframe, function() {
                        stButtons.messageQueueInstance.process()
                    });
                    stButtons.messageQueueInstance.setPumpInstance(stButtons.pumpInstance);
                    try {
                        stButtons.pumpInstance.broadcastSendMessage("Buttons Ready")
                    } catch (d) {}
                }
            }
        } catch (b) {
            this.mainstframe = document.createElement("iframe");
            this.mainstframe.allowTransparency = "true";
            this.mainstframe.setAttribute("allowTransparency", "true");
            this.mainstframe.onload = function() {
                stWidget.frameReady = true;
                stButtons.pumpInstance = new stlib.pump(stWidget.mainstframe, stWidget.mainstframe, function() {
                    stButtons.messageQueueInstance.process()
                });
                stButtons.messageQueueInstance.setPumpInstance(stButtons.pumpInstance);
                try {
                    stButtons.pumpInstance.broadcastSendMessage("Buttons Ready")
                } catch (d) {}
            }
        }
        this.mainstframe.id = "stLframe";
        this.mainstframe.className = "stLframe";
        this.mainstframe.name = "stLframe";
        this.mainstframe.frameBorder = "0";
        this.mainstframe.scrolling = "no";
        this.mainstframe.width = "353px";
        this.mainstframe.height = "350px";
        this.mainstframe.style.top = "0px";
        this.mainstframe.style.left = "0px";
        this.wrapper = document.createElement("div");
        this.wrapper.id = "stwrapper";
        this.wrapper.className = "stwrapper";
        this.wrapper.style.display = "none";
        if (stWidgetVersion == "4x") {
            this.wrapper.style.display = "none"
        }
        this.closewrapper = document.createElement("div");
        this.closewrapper.className = "stclose";
        var a = 0;
        this.widgetLoadInterval = self.setInterval(function() {
            stWidget.widgetLoad();
            a += 1;
            if (a > 90) {
                stWidget.forceDefaultWidgetSetting();
                window.clearInterval(stWidget.widgetLoadInterval)
            }
        }, 1000);
        this.closewrapper.onclick = function() {
            stWidget.closeWidget()
        };
        this.ogtitle = null;
        this.ogdesc = null;
        this.ogurl = null;
        this.short_url = null;
        this.ogimg = null;
        this.ogtype = null;
        this.twittertitle = null;
        this.twitterdesc = null;
        this.twitterurl = null;
        this.twitterimg = null;
        this.twittercard = null;
        this.desc = null;
        this.initFire = false;
        this.merge = function(f, e) {
            for (var d in e) {
                if (f.hasOwnProperty(d) && e[d] !== null) {
                    f[d] = e[d]
                }
            }
        };
        this.oldScroll = 0;
        this.init = function() {
            if (stWidget.initFire == false) {
                stWidget.initFire = true;
                if (stButtons.messageQueueInstance == null) {
                    stButtons.messageQueueInstance = new stlib.messageQueue()
                }
                if (stlib.browser.ieFallback) {
                    setTimeout("stButtons.messageQueueInstance.send(stWidget.createFrag(stlib.data,'data'), 'data');", 1000)
                } else {
                    stButtons.messageQueueInstance.send(stWidget.createFrag(stlib.data, "data"), "data")
                }
                if (stlib.browser.ieFallback) {
                    setTimeout("stButtons.messageQueueInstance.send(stWidget.createFrag(null,'init'), 'init');", 2000);
                    setTimeout("stWidget.initIE=true;", 2500)
                } else {
                    stButtons.messageQueueInstance.send(stWidget.createFrag(null, "init"), "init")
                }
            }
        }
    }
}
stWidget.widgetLoad = function() {
    if (esiStatus == "loaded" || (useEdgeSideInclude == false)) {
        if (stWidgetVersion == "5xa") {
            stWidget.frameUrlChoice = stWidget.frameUrl5xa
        } else {
            if (stWidgetVersion == "4x") {
                stWidget.frameUrlChoice = stWidget.frameUrl4x
            }
        }
        stWidget.mainstframe.src = stWidget.frameUrlChoice;
        if (stWidgetVersion == "5xa") {
            stWidget.wrapper.className += " stwrapper5x";
            stWidget.mainstframe.className += " stframe5x";
            stWidget.mainstframe.width = "514px";
            stWidget.mainstframe.height = "419px";
            stWidget.wrapper.style.zIndex = 89999999;
            stWidget.overlay = document.createElement("div");
            stWidget.overlay.style.height = "100%";
            stWidget.overlay.style.width = "100%";
            stWidget.overlay.style.backgroundColor = "#000";
            stWidget.overlay.style.opacity = "0.6";
            stWidget.overlay.style.filter = "Alpha(Opacity=60)";
            stWidget.overlay.style.position = "fixed";
            if (document.all && navigator.appVersion.indexOf("MSIE 6.") != -1) {
                stWidget.overlay.style.position = "absolute"
            }
            stWidget.overlay.style.display = "none";
            stWidget.overlay.style.left = "0";
            stWidget.overlay.style.top = "0";
            stWidget.overlay.style.zIndex = 89999990;
            stWidget.overlay.setAttribute("id", "stOverlay");
            stWidget.overlay.setAttribute("onclick", "javascript:stWidget.closeWidget();")
        } else {
            stWidget.wrapper.appendChild(stWidget.closewrapper)
        }
        stWidget.wrapper.appendChild(stWidget.mainstframe);
        stWidget.widgetLoadingComplete = true;
        window.clearInterval(stWidget.widgetLoadInterval)
    }
};
stWidget.forceDefaultWidgetSetting = function() {
    window.clearInterval(stWidget.widgetLoadInterval);
    stWidget.skipESIValue = true;
    stLight.usePublisherDefaultSettings();
    if (stWidgetVersion == "5xa") {
        stWidget.frameUrlChoice = stWidget.frameUrl5xa = stWidget.frameUrl5x = (("https:" == document.location.protocol) ? "https://ws.sharethis.com/secure5x/index.html" : "http://edge.sharethis.com/share5x/index.53123d14fa98b284409a6b2d7bb67367.html")
    } else {
        if (stWidgetVersion == "4x") {
            stWidget.frameUrlChoice = stWidget.frameUrl4x
        }
    }
    stWidget.mainstframe.src = stWidget.frameUrlChoice;
    if (stWidgetVersion == "5xa") {
        stWidget.wrapper.className += " stwrapper5x";
        stWidget.mainstframe.className += " stframe5x";
        stWidget.mainstframe.width = "514px";
        stWidget.mainstframe.height = "419px";
        stWidget.wrapper.style.zIndex = 89999999;
        stWidget.overlay = document.createElement("div");
        stWidget.overlay.style.height = "100%";
        stWidget.overlay.style.width = "100%";
        stWidget.overlay.style.backgroundColor = "#000";
        stWidget.overlay.style.opacity = "0.6";
        stWidget.overlay.style.filter = "Alpha(Opacity=60)";
        stWidget.overlay.style.position = "fixed";
        if (document.all && navigator.appVersion.indexOf("MSIE 6.") != -1) {
            stWidget.overlay.style.position = "absolute"
        }
        stWidget.overlay.style.display = "none";
        stWidget.overlay.style.left = "0";
        stWidget.overlay.style.top = "0";
        stWidget.overlay.style.zIndex = 89999990;
        stWidget.overlay.setAttribute("id", "stOverlay");
        stWidget.overlay.setAttribute("onclick", "javascript:stWidget.closeWidget();")
    } else {
        stWidget.wrapper.appendChild(stWidget.closewrapper)
    }
    stWidget.wrapper.appendChild(stWidget.mainstframe);
    stWidget.widgetLoadingComplete = true
};
stWidget.options = new function() {
    this.fpc = stLight.fpc;
    this.sessionID = null;
    this.publisher = null;
    this.tracking = true;
    this.send_services = null;
    this.exclusive_services = null;
    this.headerTitle = null;
    this.headerfg = null;
    this.headerbg = null;
    this.offsetLeft = null;
    this.offsetTop = null;
    this.onhover = true;
    this.async = false;
    this.asyncPlusone = false;
    this.autoclose = true;
    this.autoPosition = true;
    this.embeds = false;
    this.doneScreen = true;
    this.minorServices = true;
    this.excludeServices = null;
    this.theme = 1;
    this.serviceBarColor = null;
    this.shareButtonColor = null;
    this.footerColor = null;
    this.headerTextColor = null;
    this.helpTextColor = null;
    this.mainWidgetColor = null;
    this.textBoxFontColor = null;
    this.textRightToLeft = false;
    this.shorten = true;
    this.popup = false;
    this.newOrZero = "new";
    this.minShareCount = null;
    this.publisherGA = null;
    this.services = "";
    this.relatedDomain = null;
    this.hashAddressBar = null;
    this.doNotHash = null;
    this.doNotCopy = null;
    this.nativeCount = false;
    this.lang = "";
    this.fbLang = "";
    this.fbLoad = true;
    this.servicePopup = false;
    this.textcause = null;
    this.linkcause = null;
    this.snapsets = null;
    this.publisherMigration = false
};
stWidget.addEntry = function(a) {
    if (!a.element) {
        return false
    }
    if (a && a.service && ((a.service == "email" || a.service == "sharethis" || a.service == "wordpress") || ((stIsLoggedIn && servicesLoggedIn && typeof(servicesLoggedIn[a.service]) != "undefined" && ((useFastShare || (!useFastShare && (stWidgetVersion == "5xa"))) && (a.service == "facebook" || a.service == "twitter" || a.service == "yahoo" || a.service == "linkedin")))))) {
        openWidget = true
    } else {
        openWidget = false
    }
    if (!openWidget) {
        if (a.type !== "custom") {
            a.element.appendChild(stButtons.makeButton(a));
            if (a.service == "plusone" || a.service == "googleplusfollow" || a.service == "googleplusadd") {
                stButtons.getPlusOneFromGoogle(a.service)
            }
            if (a.service == "fblike" || a.service == "fbsend" || a.service == "fbrec" || a.service == "fbLong" || a.service == "fbsub") {
                stButtons.getXFBMLFromFB(a.element)
            }
            if (stlib.nativeButtons.checkNativeButtonSupport(a.service)) {
                stlib.nativeButtons.loadService(a.service)
            }
        } else {
            stButtons.makeButton(a)
        }
        stlib.buttonInfo.addButton(a);
        return true
    } else {
        if (a.type != "custom") {
            a.element.appendChild(stButtons.makeButton(a));
            if (a.service == "plusone" || a.service == "googleplusfollow" || a.service == "googleplusadd") {
                stButtons.getPlusOneFromGoogle(a.service)
            }
            if (a.service == "fblike" || a.service == "fbsend" || a.service == "fbrec" || a.service == "fbLong" || a.service == "fbsub") {
                stButtons.getXFBMLFromFB(a.element)
            }
            if (stlib.nativeButtons.checkNativeButtonSupport(a.service)) {
                stlib.nativeButtons.loadService(a.service)
            }
        } else {
            stButtons.makeButton(a)
        }
        var d = new Shareable(a);
        d.idx = stWidget.entries;
        stWidget.entries++;
        d.publisher = stLight.publisher;
        d.sessionID = stLight.sessionID;
        d.fpc = stLight.fpc;
        if (a.element.getAttribute("st_via") != null) {
            d.via = a.element.getAttribute("st_via").replace(/^\s+|\s+$/g, "")
        }
        d.url = stWidget.ogurl ? stWidget.ogurl : (stWidget.twitterurl ? stWidget.twitterurl : document.location.href);
        d.url = a.url ? a.url : d.url;
        if (!stlib.hash.doNotHash) {
            d.url = stlib.hash.appendHash(d.url);
            a.url = d.url
        }
        stlib.data.set("url", d.url, "shareInfo");
        stWidget.short_url = d.short_url;
        stlib.data.set("short_url", d.short_url, "shareInfo");
        d.title = stWidget.ogtitle ? stWidget.ogtitle : (stWidget.twittertitle ? stWidget.twittertitle : document.title);
        d.title = a.title ? a.title : d.title;
        var b = stWidget.ogimg ? stWidget.ogimg : (stWidget.twitterimg ? stWidget.twitterimg : (a.element.thumbnail ? a.element.thumbnail : null));
        d.image = (a.element.image) ? a.element.image : b;
        d.summary = stWidget.ogdesc ? stWidget.ogdesc : (stWidget.twitterdesc ? stWidget.twitterdesc : stWidget.desc);
        d.summary = a.element.summary ? a.element.summary : d.summary;
        stWidget.merge(d, stWidget.options);
        if (typeof(stWidget.options.textRightToLeft) != "undefined" && stWidget.options.textRightToLeft != "null" && stWidget.options.textRightToLeft == true) {
            document.getElementById("stwrapper").style.top = "auto";
            document.getElementById("stwrapper").style.left = "auto"
        }
        d.mouseOn = function() {
            stWidget.mouseOnTimer = setTimeout(d.decideFastShare, 500)
        };
        d.mouseOut = function() {
            clearInterval(stWidget.mouseOnTimer)
        };
        d.decideFastShare = function() {
            if (stlib.browser.ieFallback) {
                if (typeof(stWidget.initIE) == "undefined" || stWidget.initIE != true) {
                    return
                }
            }
            if (!useFastShare || !stIsLoggedIn || a.service == "email" || a.service == "sharethis" || a.service == "wordpress" || (typeof(servicesLoggedIn[a.service]) == "undefined" && (a.service == "facebook" || a.service == "twitter" || a.service == "linkedin" || a.service == "yahoo"))) {
                if (stlib.browser.mobile.handleForMobileFriendly(d, a, stWidget.options)) {
                    stLight.log("widget", "mobile", a.service, a.type)
                } else {
                    d.popup()
                }
            } else {
                stLight.log("widget", "fastShare", a.service, a.type);
                stFastShareObj.url = d.url;
                stFastShareObj.short_url = d.short_url;
                stFastShareObj.title = d.title;
                stFastShareObj.image = d.image;
                if (typeof(d.summary) != "undefined" && d.summary != null) {
                    stFastShareObj.summary = d.summary
                }
                stFastShareObj.via = null;
                if (a.service == "twitter" && d.element.getAttribute("st_via") != null) {
                    stFastShareObj.via = d.element.getAttribute("st_via").replace(/^\s+|\s+$/g, "")
                }
                stFastShareObj.message = d.message;
                stFastShareObj.element = a.element;
                stFastShareObj.service = a.service;
                stFastShareObj.type = a.type;
                stFastShareObj.publisher = stlib.data.get("publisher", "pageInfo");
                stFastShareObj.fpc = stlib.data.get("fpc", "pageInfo");
                stFastShareObj.sessionID = stlib.data.get("sessionID", "pageInfo");
                stFastShareObj.hostname = stlib.data.get("hostname", "pageInfo");
                stFastShareObj.username = servicesLoggedIn[a.service];
                if (typeof(fastShare) == "undefined") {
                    stLight.odjs((("https:" == document.location.protocol) ? "https://ws.sharethis.com/button/fastShare.js" : "http://w.sharethis.com/button/fastShare.js"), function() {
                        fastShare.showWidget()
                    })
                } else {
                    fastShare.showWidget()
                }
            }
        };
        d.popup = function() {
            if (stWidget.widgetOpen == false) {
                if (stWidgetVersion == "4x") {
                    stWidget.stCancelClose()
                }
                var h = stLight.getSource2(a);
                stLight.log("widget", h, a.service, a.type);
                if (stWidget.options.popup && (stWidgetVersion == "4x")) {
                    var j = stWidget.createFrag(d);
                    _$d_();
                    _$d1("4x Popup Called");
                    _$d1(j);
                    _$d_();
                    window.open(stWidget.frameUrl4x + "#" + j, "newstframe", "status=1,toolbar=0,width=345,height=375")
                } else {
                    if (stWidget.options.popup && (stWidgetVersion == "5xa")) {
                        var i = "http://sharethis.com/share?url=" + d.url;
                        if (d.title != null) {
                            i += "&title=" + d.title
                        }
                        if (d.image != null) {
                            i += "&img=" + d.image
                        }
                        if (d.summary != null) {
                            i += "&summary=" + d.summary
                        }
                        if (a.type != null) {
                            i += "&type=" + a.type
                        }
                        if (d.via != null) {
                            i += "&via=" + d.via
                        }
                        var g = "";
                        if (stlib.data) {
                            var f = stlib.json.encode(stlib.data.pageInfo);
                            var e = stlib.json.encode(stlib.data.shareInfo);
                            if (stlib.browser.isFirefox() && !stlib.browser.firefox8Version()) {
                                f = encodeURIComponent(encodeURIComponent(f));
                                e = encodeURIComponent(encodeURIComponent(e))
                            } else {
                                f = encodeURIComponent(f);
                                e = encodeURIComponent(e)
                            }
                            g = "&pageInfo=" + f + "&shareInfo=" + e
                        }
                        window.open(i + g, "newstframe", "status=1,toolbar=0,width=820,height=950")
                    } else {
                        stButtons.messageQueueInstance.send(stWidget.createFrag(d), "light");
                        stWidget.positionWidget(d);
                        if (stWidget.options.embeds == false) {
                            stWidget.hideEmbeds()
                        }
                        setTimeout(function() {
                            stWidget.widgetOpen = true;
                            st_showing = true
                        }, 200)
                    }
                }
            } else {
                if (stWidget.widgetOpen == true && stWidget.options.onhover == false) {}
            }
            return false
        };
        d.init();
        stlib.buttonInfo.addButton(d);
        return d
    }
};
stWidget.createFrag = function(a, j) {
    var i = "light";
    i = stWidget.options.popup ? "popup" : i;
    __stgetPubGA();
    if (j == "data") {
        i = "data";
        for (var b in a) {
            if (a.hasOwnProperty(b) == true && a[b] !== null && typeof(a[b]) != "function") {
                if (typeof(a[b]) == "object") {
                    var e = stlib.json.encode(a[b])
                } else {
                    var e = a[b]
                }
                if (stlib.browser.isFirefox() && !stlib.browser.firefox8Version()) {
                    i = i + "/" + b + "=" + encodeURIComponent(encodeURIComponent(e))
                } else {
                    i = i + "/" + b + "=" + encodeURIComponent(e)
                }
            }
        }
    } else {
        if (j == "init") {
            i = "init";
            if (stWidget.options.tracking && stWidget.options.publisherGA == null) {
                if (typeof(pageTracker) != "undefined" && pageTracker !== null) {
                    stWidget.options.publisherGA = pageTracker._getAccount()
                } else {
                    if (stWidget.options.publisherGA == null && typeof(__stPubGA) !== "undefined") {
                        stWidget.options.publisherGA = __stPubGA
                    }
                }
            }
            for (var b in stWidget.options) {
                if (stWidget.options.hasOwnProperty(b) == true && stWidget.options[b] !== null && typeof(stWidget.options[b]) != "function" && typeof(stWidget.options[b]) != "object") {
                    var h = stWidget.options[b];
                    try {
                        h = decodeURIComponent(h);
                        h = decodeURIComponent(h)
                    } catch (d) {}
                    i = i + "/" + b + "=" + encodeURIComponent(h)
                }
            }
            i = i + "/pUrl=" + encodeURIComponent(encodeURIComponent(document.location.href)) + ((document.title != "") ? "/title=" + encodeURIComponent(encodeURIComponent(document.title)) : "") + "/stLight=true"
        } else {
            for (var b in a) {
                if (a.hasOwnProperty(b) == true && a[b] !== null && typeof(a[b]) != "function" && typeof(a[b]) != "object" && b !== "idx") {
                    i = i + "/" + b + "-=-" + encodeURIComponent(encodeURIComponent(a[b]))
                }
            }
            if (a.service == "email") {
                i = i + "/page-=-send"
            }
            if (stWidgetVersion == "5xa") {
                if (a.service == "facebook") {
                    i = i + "/page-=-fbhome"
                } else {
                    if (a.service == "twitter") {
                        i = i + "/page-=-twhome"
                    } else {
                        if (a.service == "yahoo") {
                            i = i + "/page-=-ybhome"
                        } else {
                            if (a.service == "linkedin") {
                                i = i + "/page-=-lihome"
                            } else {
                                if (a.service == "wordpress") {
                                    i = i + "/page-=-wphome"
                                }
                            }
                        }
                    }
                }
            }
            if (stlib.data) {
                var g = stlib.json.encode(stlib.data.pageInfo);
                var f = stlib.json.encode(stlib.data.shareInfo);
                if (stlib.browser.isFirefox() && !stlib.browser.firefox8Version()) {
                    g = encodeURIComponent(encodeURIComponent(g));
                    f = encodeURIComponent(encodeURIComponent(f))
                } else {
                    g = encodeURIComponent(g);
                    f = encodeURIComponent(f)
                }
                i += "/pageInfo-=-" + g;
                i += "/shareInfo-=-" + f
            }
        }
    }
    return i
};
stWidget.positionWidget = function(o) {
    function getHW(elem) {
        var retH = 0;
        var retW = 0;
        var going = true;
        while (elem != null) {
            retW += elem.offsetLeft;
            if (going) {
                retH += elem.offsetTop
            }
            if (window.getComputedStyle) {
                if (document.defaultView.getComputedStyle(elem, null).getPropertyValue("position") == "fixed") {
                    retH += (document.documentElement.scrollTop || document.body.scrollTop);
                    going = false
                }
            } else {
                if (elem.currentStyle) {
                    if (elem.currentStyle.position == "fixed") {
                        retH += (document.documentElement.scrollTop || document.body.scrollTop);
                        going = false
                    }
                }
            }
            elem = elem.offsetParent
        }
        return {
            height: retH,
            width: retW
        }
    }
    if (!o) {
        return false
    }
    if (stWidgetVersion == "4x") {
        shareel = o.element;
        var curleft = curtop = 0;
        var mPos = getHW(shareel);
        curleft = mPos.width;
        curtop = mPos.height;
        shareel = o.element;
        var eltop = 0;
        var elleft = 0;
        var topVal = 0;
        var leftVal = 0;
        var elemH = 0;
        var elemW = 0;
        eltop = curtop + shareel.offsetHeight + 5;
        elleft = curleft + 5;
        topVal = (eltop + (stWidget.options.offsetTop ? stWidget.options.offsetTop : 0));
        topVal = eval(topVal);
        elemH = topVal;
        topVal += "px";
        leftVal = (elleft + (stWidget.options.offsetLeft ? stWidget.options.offsetLeft : 0));
        leftVal = eval(leftVal);
        elemW = leftVal;
        leftVal += "px";
        stWidget.wrapper.style.top = topVal;
        stWidget.wrapper.style.left = leftVal;
        if (stWidget.options.autoPosition == true) {
            stWidget.oldScroll = document.body.scrollTop;
            var pginfo = stWidget.pageSize();
            var effectiveH = pginfo.height + pginfo.scrY;
            var effectiveW = pginfo.width + pginfo.scrX;
            var widgetH = 330;
            var widgetW = 330;
            var needH = widgetH + elemH;
            var needW = widgetW + elemW;
            var diffH = needH - effectiveH;
            var diffW = needW - effectiveW;
            var newH = elemH - diffH;
            var newW = elemW - diffW;
            var buttonPos = getHW(shareel);
            var leftA, rightA, topA, bottomA = false;
            if (diffH > 0) {
                bottomA = false;
                topA = true;
                if ((buttonPos.height - widgetH) > 0) {
                    newH = buttonPos.height - widgetH
                }
                stWidget.wrapper.style.top = newH + "px"
            }
            if (diffW > 0) {
                leftA = false;
                rightA = true;
                if ((buttonPos.width - widgetW) > 0) {
                    newW = buttonPos.width - widgetW
                }
                stWidget.wrapper.style.left = newW + "px"
            }
        }
        if (stWidget.options.autoPosition == "center") {
            stWidget.wrapper.style.top = "15%";
            stWidget.wrapper.style.left = "35%";
            stWidget.wrapper.style.position = "fixed"
        }
    } else {
        document.getElementById("stOverlay").style.display = "block";
        var topVal;
        if (stWidget.options.autoPosition == true) {
            stWidget.wrapper.style.textAlign = "left"
        }
        if (stWidgetVersion == "5xa") {
            stWidget.wrapper.style.position = "fixed";
            if (document.all && navigator.appVersion.indexOf("MSIE 6.") != -1) {
                stWidget.wrapper.style.position = "absolute"
            }
        }
    }
    stWidget.wrapper.style.visibility = "visible";
    stWidget.wrapper.style.display = "block";
    stWidget.mainstframe.style.visibility = "visible"
}, stWidget.hideWidget = function() {
    if (stWidget.wrapper.style.visibility !== "hidden") {
        stWidget.wrapper.style.visibility = "hidden"
    }
    if (stWidget.mainstframe.style.visibility !== "hidden") {
        stWidget.mainstframe.style.visibility = "hidden"
    }
    if (stWidgetVersion == "4x") {
        stWidget.wrapper.style.display = "none"
    }
    if (stWidgetVersion == "5xa") {
        document.getElementById("stOverlay").style.display = "none"
    }
};
stWidget.pageSize = function() {
    var f = [0, 0, 0, 0];
    var b = 0;
    var a = 0;
    var e = 0;
    var d = 0;
    if (typeof(window.pageYOffset) == "number") {
        b = window.pageXOffset;
        a = window.pageYOffset
    } else {
        if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
            b = document.body.scrollLeft;
            a = document.body.scrollTop
        } else {
            if (document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
                b = document.documentElement.scrollLeft;
                a = document.documentElement.scrollTop
            }
        }
    }
    if (window.innerWidth) {
        e = window.innerWidth;
        d = window.innerHeight
    } else {
        if (document.documentElement.offsetWidth) {
            e = document.documentElement.offsetWidth;
            d = document.documentElement.offsetHeight
        }
    }
    f = {
        scrX: b,
        scrY: a,
        width: e,
        height: d
    };
    return f
};
stWidget.closetimeout = null;
stWidget.stClose = function(a) {
    if (!a) {
        a = 1000
    }
    if ((stWidgetVersion == "4x") && stWidget.options.autoclose != null && (stWidget.options.autoclose == true || stWidget.options.autoclose == "true")) {
        if (stWidget.openDuration < 0.5 && stWidget.stopClosing == false) {
            stWidget.closetimeout = setTimeout("stWidget.closeWidget()", a)
        } else {
            stWidget.stopClosing = true
        }
    }
};
stWidget.stCancelClose = function() {
    clearTimeout(stWidget.closetimeout);
    stWidget.buttonClicked = true;
    setTimeout(function() {
        stWidget.buttonClicked = false
    }, 100)
};
stWidget.closeWidget = function() {
    if (st_showing == false) {
        return false
    }
    st_showing = false;
    stWidget.widgetOpen = false;
    stWidget.wrapper.style.display = "none";
    stWidget.mainstframe.style.visibility = "hidden";
    stWidget.showEmbeds();
    stWidget.sendEvent("screen", "home");
    if (stWidgetVersion == "5xa") {
        document.getElementById("stOverlay").style.display = "none"
    } else {
        stWidget.wrapper.style.top = "-999px";
        stWidget.wrapper.style.left = "-999px";
        stWidget.wrapper.style.display = "none"
    }
};
stWidget.hideEmbeds = function() {
    var b = document.getElementsByTagName("embed");
    for (var a = 0; a < b.length; a++) {
        b[a].style.visibility = "hidden"
    }
};
stWidget.showEmbeds = function() {
    if (stWidget.options.embeds == true) {
        return true
    }
    var b = document.getElementsByTagName("embed");
    for (var a = 0; a < b.length; a++) {
        b[a].style.visibility = "visible"
    }
};
stWidget.sendEvent = function(a, d) {
    var b = "widget/" + a + "=" + d;
    stButtons.messageQueueInstance.send(b, "widget")
};
stWidget.getMetaTags = function() {
    stWidget.getOGTags();
    stWidget.getTwitterTags()
};
stWidget.getOGTags = function() {
    var d = document.getElementsByTagName("meta");
    for (var a = 0; a < d.length; a++) {
        var b = d[a].getAttribute("property");
        if (b == null) {
            b = d[a].getAttribute("name")
        }
        if (b == "og:title") {
            stWidget.ogtitle = d[a].getAttribute("content")
        } else {
            if (b == "og:type") {
                stWidget.ogtype = d[a].getAttribute("content")
            } else {
                if (b == "og:url") {
                    stWidget.ogurl = d[a].getAttribute("content")
                } else {
                    if (b == "og:image") {
                        stWidget.ogimg = d[a].getAttribute("content").replace(/^\s+|\s+$/g, "")
                    } else {
                        if (b == "og:description") {
                            stWidget.ogdesc = d[a].getAttribute("content")
                        } else {
                            if (b == "description" || b == "Description") {
                                stWidget.desc = d[a].getAttribute("content")
                            }
                        }
                    }
                }
            }
        }
    }
};
stWidget.getTwitterTags = function() {
    var d = document.getElementsByTagName("meta");
    for (var a = 0; a < d.length; a++) {
        var b = d[a].getAttribute("name");
        if (b == null) {
            b = d[a].getAttribute("property")
        }
        if (b == "twitter:card") {
            stWidget.twittercard = d[a].getAttribute("content")
        } else {
            if (b == "twitter:url") {
                stWidget.twitterurl = d[a].getAttribute("content")
            } else {
                if (b == "twitter:title") {
                    stWidget.twittertitle = d[a].getAttribute("content")
                } else {
                    if (b == "twitter:description") {
                        stWidget.twitterdesc = d[a].getAttribute("content")
                    } else {
                        if (b == "twitter:image") {
                            stWidget.twitterimg = d[a].getAttribute("content")
                        } else {
                            if (b == "description" || b == "Description") {
                                stWidget.desc = d[a].getAttribute("content")
                            }
                        }
                    }
                }
            }
        }
    }
};

function shareLog(a, b) {
    if (typeof(ga) !== "undefined") {
        ga("send", "event", "ShareThis", a, b)
    } else {
        if (typeof(pageTracker) != "undefined" && pageTracker !== null && typeof(pageTracker._trackEvent) != "undefined") {
            pageTracker._trackEvent("ShareThis", a, b)
        } else {
            if (typeof(_gaq) != "undefined" && _gaq !== null) {
                _gaq.push(["_trackEvent", "ShareThis", a, b])
            } else {
                if (stButtons.publisherTracker !== null) {
                    stButtons.publisherTracker._trackEvent("ShareThis", a, b)
                } else {
                    if (typeof(_gat) != "undefined" && _gat !== null) {
                        if (typeof(stWidget.options.publisherGA) != "undefined" && stWidget.options.publisherGA != null) {
                            stButtons.publisherTracker = _gat._getTracker(stWidget.options.publisherGA);
                            stButtons.publisherTracker._trackEvent("ShareThis", a, b)
                        }
                    }
                }
            }
        }
    }
}
stButtons.completeInit = function() {
    if (!stButtons.goToInit) {
        stButtons.goToInit = true;
        var a = self.setInterval(function() {
            if (stWidget.widgetLoadingComplete) {
                stWidget.getMetaTags();
                document.body.appendChild(stWidget.wrapper);
                if (stWidgetVersion == "5xa") {
                    document.body.appendChild(stWidget.overlay)
                }
                if (stWidgetVersion == "4x") {
                    try {
                        var d = document.getElementById("stLframe");
                        d.onmouseover = function() {
                            stWidget.stCancelClose();
                            stWidget.inTime = (new Date()).getTime()
                        };
                        d.onmouseout = function() {
                            stWidget.outTime = (new Date()).getTime();
                            stWidget.openDuration = (stWidget.outTime - stWidget.inTime) / 1000;
                            stWidget.stClose()
                        };
                        try {
                            if (document.body.attachEvent) {
                                document.body.attachEvent("onclick", function() {
                                    if (stWidget.buttonClicked == false) {
                                        stWidget.stopClosing = false;
                                        stWidget.openDuration = 0;
                                        stWidget.stClose(100)
                                    }
                                })
                            } else {
                                document.body.setAttribute("onclick", "if(stWidget.buttonClicked==false){stWidget.stopClosing=false;stWidget.openDuration=0;stWidget.stClose(100);}")
                            }
                        } catch (b) {
                            document.body.onclick = function() {
                                if (stWidget.buttonClicked == false) {
                                    stWidget.stopClosing = false;
                                    stWidget.openDuration = 0;
                                    stWidget.stClose(100)
                                }
                            }
                        }
                    } catch (b) {}
                }
                stButtons.makeButtons();
                stWidget.init();
                window.clearInterval(a)
            }
        }, 1000)
    }
};
plusoneCallback = function(a) {
    if (a.state == "on") {
        stlib.data.resetShareData();
        stlib.data.set("url", a.href, "shareInfo");
        stlib.data.set("short_url", stWidget.short_url, "shareInfo");
        stlib.data.set("destination", "plusone", "shareInfo");
        stlib.data.setSource("chicklet");
        stlib.data.set("buttonType", "chicklet", "shareInfo");
        stlib.sharer.share()
    }
};
stButtons.trackFB = function() {
    try {
        if (!stButtons.fbTracked && typeof(FB) != "undefined" && typeof(FB.Event) != "undefined" && typeof(FB.Event.subscribe) != "undefined") {
            stButtons.fbTracked = true;
            FB.Event.subscribe("edge.create", function(b) {
                stButtons.trackShare("fblike_auto", b);
                stLight.callSubscribers("click", "fblike", b)
            });
            FB.Event.subscribe("edge.remove", function(b) {
                stButtons.trackShare("fbunlike_auto", b);
                stLight.callSubscribers("click", "fbunlike", b)
            });
            FB.Event.subscribe("message.send", function(b) {
                stButtons.trackShare("fbsend_auto", b);
                stLight.callSubscribers("click", "fbsend", b)
            })
        }
    } catch (a) {}
};
stButtons.trackTwitter = function() {
    if (!stButtons.twitterTracked && typeof(twttr) != "undefined" && typeof(twttr.events) != "undefined" && typeof(twttr.events.bind) != "undefined") {
        stButtons.twitterTracked = true;
        twttr.events.bind("click", function(a) {
            stButtons.trackTwitterEvent("click");
            stLight.callSubscribers("click", "twitter")
        });
        twttr.events.bind("tweet", function() {
            stButtons.trackTwitterEvent("tweet")
        });
        twttr.events.bind("retweet", function() {
            stButtons.trackTwitterEvent("retweet");
            stLight.callSubscribers("click", "retweet")
        });
        twttr.events.bind("favorite", function() {
            stButtons.trackTwitterEvent("favorite");
            stLight.callSubscribers("click", "favorite")
        });
        twttr.events.bind("follow", function() {
            stButtons.trackTwitterEvent("follow");
            stLight.callSubscribers("click", "follow")
        })
    }
};
stButtons.trackTwitterEvent = function(a) {
    stButtons.trackShare("twitter_" + a + "_auto")
};
stButtons.trackShare = function(a, d) {
    if (typeof(d) !== "undefined" && d !== null) {
        var b = d
    } else {
        var b = document.location.href
    }
    stlib.data.resetShareData();
    stlib.data.set("url", b, "shareInfo");
    stlib.data.set("short_url", stWidget.short_url, "shareInfo");
    stlib.data.set("destination", a, "shareInfo");
    stlib.data.set("buttonType", "chicklet", "shareInfo");
    stlib.data.setSource("chicklet");
    stlib.sharer.share()
};
stLight.processSTQ = function() {
    if (typeof(_stq) != "undefined") {
        for (var a = 0; a < _stq.length; a++) {
            var b = _stq[a];
            stLight.options(b)
        }
    } else {
        return false
    }
};
stLight.onDomContentLoaded = function() {
    stLight.onReady();
    stButtons.trackTwitter()
};
// stLight.onDomContentLoadedLazy = function() {
//     stLight.loadServicesLoggedIn(function() {
//         stLight.getAllAppDefault(function() {
//             stlib.data.init();
//             stButtons.locateElements();
//             stButtons.makeButtons()
//         })
//     })
// };
// stLight.messageReceiver = function(b) {
//     if (b && (b.origin == "http://edge.sharethis.com" || b.origin == "https://ws.sharethis.com")) {
//         var d = b.data;
//         d = d.split("|");
//         if (d[0] == "ShareThis" && d.length > 2) {
//             var a = (typeof(d[3]) == "undefined") ? document.location.href : d[3];
//             stLight.callSubscribers(d[1], d[2], a)
//         }
//     }
// };
stLight.subscribe = function(b, a) {
    if (b == "click") {
        stLight.clickSubscribers.push(a)
    } else {
        stLight.nonClickSubscribers.push(a)
    }
};
stLight.callSubscribers = function(e, a, b) {
    if (e == "click") {
        for (var d = 0; d < stLight.clickSubscribers.length; d++) {
            stLight.clickSubscribers[d]("click", a, b)
        }
    }
};
stLight.gaTS = function(d, a, b) {
    var e = "";
    var f = "";
    if (a == "fblike") {
        e = "ShareThis_facebook";
        f = "Like"
    } else {
        if (a == "fbunlike") {
            e = "ShareThis_facebook";
            f = "UnLike"
        } else {
            if (a == "fbsend") {
                e = "ShareThis_facebook";
                f = "Send"
            } else {
                if (a == "twitter") {
                    e = "ShareThis_twitter";
                    f = "Share"
                } else {
                    if (a == "retweet") {
                        e = "ShareThis_twitter";
                        f = "ReTweet"
                    } else {
                        if (a == "favorite") {
                            e = "ShareThis_twitter";
                            f = "Favorite"
                        } else {
                            if (a == "follow") {
                                e = "ShareThis_twitter";
                                f = "Follow"
                            } else {
                                e = "ShareThis_" + a;
                                f = "Share"
                            }
                        }
                    }
                }
            }
        }
    }
    if (typeof(ga) !== "undefined") {
        ga("send", "social", e, f, b)
    } else {
        if (typeof(_gaq) != "undefined") {
            _gaq.push(["_trackSocial", e, f, b])
        }
    }
};
stButtons.onReady = function() {
    var h = document.getElementsByTagName("*");
    var b = [];
    var d = new RegExp(/sharethis_smartbuttons/);
    var a = false;
    for (var j = 0; j < h.length; j++) {
        if (typeof(h[j].className) == "string" && h[j].className != "") {
            if (h[j].className.match(d)) {
                a = true;
                break
            }
        }
    }
    if (a) {
        var g = document.getElementsByTagName("head")[0];
        var e = ["return=json", "cb=stButtons.smartifyButtons"];
        e = e.join("&");
        var f = (("https:" == document.location.protocol) ? "https://ws." : "http://wd.") + "sharethis.com/api/getRecentServices.php?" + e;
        var i = document.createElement("script");
        i.setAttribute("type", "text/javascript");
        i.setAttribute("src", f);
        g.appendChild(i);
        setTimeout("stButtons.completeInit()", 2000)
    } else {
        stButtons.completeInit()
    }
    stLight.subscribe("click", stLight.gaTS);
    if (stlib.browser.ieFallback && stlib.browser.getIEVersion() < 9) {
        return
    } else {
       
    }
};
stLight.domReady = function() {
    stLight.onReady();
    stButtons.trackTwitter();
    __stgetPubGA();
    if (typeof(__stPubGA) !== "undefined" && stLight.readyRun == true && stWidget.frameReady == true) {
        stWidget.sendEvent("publisherGA", __stPubGA)
    }
};
stButtons.goToInit = false;
stButtons.widget = false;
stButtons.widgetArray = [];
stButtons.cbAppQueue = [];
stButtons.queue = [];
stButtons.cbQueue = [];
stButtons.cbNativeQueue = [];
stButtons.cbVal = 0;
stButtons.queuePos = 0;
stButtons.counts = [];
st_showing = false;
stButtons.urlElements = [];
stButtons.publisherTracker = null;
stButtons.plusOneLoaded = false;
stButtons.plusOneLoading = false;
stButtons.xfbmlLoaded = false;
stButtons.xfbmlLoading = false;
stButtons.fbTracked = false;
stButtons.twitterTracked = false;
stButtons.pumpInstance = null;
stButtons.messageQueueInstance = null;
stButtons.countsResp = [];
stButtons.countsNativeResp = [];
stWidget.getMetaTags();
stLight.clickSubscribers = [];
stLight.nonClickSubscribers = [];
var __stPubGA;
if (window.document.readyState == "completed") {
    stLight.domReady()
} else {
    if (typeof(window.addEventListener) != "undefined") {
        window.addEventListener("load", stLight.domReady, false)
    } else {
        if (typeof(document.addEventListener) != "undefined") {
            document.addEventListener("load", stLight.domReady, false)
        } else {
            if (typeof window.attachEvent != "undefined") {
                window.attachEvent("onload", stLight.domReady)
            }
        }
    }
}
if (typeof(window.addEventListener) != "undefined") {
    window.addEventListener("click", function() {
        stWidget.closeWidget()
    }, false)
} else {
    if (typeof(document.addEventListener) != "undefined") {
        document.addEventListener("click", function() {
            stWidget.closeWidget()
        }, false)
    } else {
        if (typeof window.attachEvent != "undefined") {
            window.attachEvent("onclick", function() {
                stWidget.closeWidget()
            })
        }
    }
}
if (typeof(__st_loadLate) == "undefined") {
    if (typeof(window.addEventListener) != "undefined") {
        window.addEventListener("DOMContentLoaded", stLight.onDomContentLoaded, false)
    } else {
        if (typeof(document.addEventListener) != "undefined") {
            document.addEventListener("DOMContentLoaded", stLight.onDomContentLoaded, false)
        }
    }
} else {
    if (typeof(window.addEventListener) != "undefined") {
        window.addEventListener("DOMContentLoaded", stLight.onDomContentLoadedLazy, false)
    } else {
        if (typeof(document.addEventListener) != "undefined") {
            document.addEventListener("DOMContentLoaded", stLight.onDomContentLoadedLazy, false)
        }
    }
}
if (typeof(window.addEventListener) != "undefined") {
    window.addEventListener("message", stLight.messageReceiver, false)
} else {
    if (typeof(document.addEventListener) != "undefined") {
        document.addEventListener("message", stLight.messageReceiver, false)
    } else {
        if (typeof window.attachEvent != "undefined") {
            window.attachEvent("onmessage", stLight.messageReceiver)
        }
    }
}
if (document.readyState == "complete" && stLight.readyRun == false) {
    stLight.domReady()
};
(function() {
    var n = this,
        t = n._,
        r = Array.prototype,
        e = Object.prototype,
        u = Function.prototype,
        i = r.push,
        a = r.slice,
        o = r.concat,
        l = e.toString,
        c = e.hasOwnProperty,
        f = Array.isArray,
        s = Object.keys,
        p = u.bind,
        h = function(n) {
            return n instanceof h ? n : this instanceof h ? void(this._wrapped = n) : new h(n)
        };
    "undefined" != typeof exports ? ("undefined" != typeof module && module.exports && (exports = module.exports = h), exports._ = h) : n._ = h, h.VERSION = "1.7.0";
    var g = function(n, t, r) {
        if (t === void 0) return n;
        switch (null == r ? 3 : r) {
            case 1:
                return function(r) {
                    return n.call(t, r)
                };
            case 2:
                return function(r, e) {
                    return n.call(t, r, e)
                };
            case 3:
                return function(r, e, u) {
                    return n.call(t, r, e, u)
                };
            case 4:
                return function(r, e, u, i) {
                    return n.call(t, r, e, u, i)
                }
        }
        return function() {
            return n.apply(t, arguments)
        }
    };
    h.iteratee = function(n, t, r) {
        return null == n ? h.identity : h.isFunction(n) ? g(n, t, r) : h.isObject(n) ? h.matches(n) : h.property(n)
    }, h.each = h.forEach = function(n, t, r) {
        if (null == n) return n;
        t = g(t, r);
        var e, u = n.length;
        if (u === +u)
            for (e = 0; u > e; e++) t(n[e], e, n);
        else {
            var i = h.keys(n);
            for (e = 0, u = i.length; u > e; e++) t(n[i[e]], i[e], n)
        }
        return n
    }, h.map = h.collect = function(n, t, r) {
        if (null == n) return [];
        t = h.iteratee(t, r);
        for (var e, u = n.length !== +n.length && h.keys(n), i = (u || n).length, a = Array(i), o = 0; i > o; o++) e = u ? u[o] : o, a[o] = t(n[e], e, n);
        return a
    };
    var v = "Reduce of empty array with no initial value";
    h.reduce = h.foldl = h.inject = function(n, t, r, e) {
        null == n && (n = []), t = g(t, e, 4);
        var u, i = n.length !== +n.length && h.keys(n),
            a = (i || n).length,
            o = 0;
        if (arguments.length < 3) {
            if (!a) throw new TypeError(v);
            r = n[i ? i[o++] : o++]
        }
        for (; a > o; o++) u = i ? i[o] : o, r = t(r, n[u], u, n);
        return r
    }, h.reduceRight = h.foldr = function(n, t, r, e) {
        null == n && (n = []), t = g(t, e, 4);
        var u, i = n.length !== +n.length && h.keys(n),
            a = (i || n).length;
        if (arguments.length < 3) {
            if (!a) throw new TypeError(v);
            r = n[i ? i[--a] : --a]
        }
        for (; a--;) u = i ? i[a] : a, r = t(r, n[u], u, n);
        return r
    }, h.find = h.detect = function(n, t, r) {
        var e;
        return t = h.iteratee(t, r), h.some(n, function(n, r, u) {
            return t(n, r, u) ? (e = n, !0) : void 0
        }), e
    }, h.filter = h.select = function(n, t, r) {
        var e = [];
        return null == n ? e : (t = h.iteratee(t, r), h.each(n, function(n, r, u) {
            t(n, r, u) && e.push(n)
        }), e)
    }, h.reject = function(n, t, r) {
        return h.filter(n, h.negate(h.iteratee(t)), r)
    }, h.every = h.all = function(n, t, r) {
        if (null == n) return !0;
        t = h.iteratee(t, r);
        var e, u, i = n.length !== +n.length && h.keys(n),
            a = (i || n).length;
        for (e = 0; a > e; e++)
            if (u = i ? i[e] : e, !t(n[u], u, n)) return !1;
        return !0
    }, h.some = h.any = function(n, t, r) {
        if (null == n) return !1;
        t = h.iteratee(t, r);
        var e, u, i = n.length !== +n.length && h.keys(n),
            a = (i || n).length;
        for (e = 0; a > e; e++)
            if (u = i ? i[e] : e, t(n[u], u, n)) return !0;
        return !1
    }, h.contains = h.include = function(n, t) {
        return null == n ? !1 : (n.length !== +n.length && (n = h.values(n)), h.indexOf(n, t) >= 0)
    }, h.invoke = function(n, t) {
        var r = a.call(arguments, 2),
            e = h.isFunction(t);
        return h.map(n, function(n) {
            return (e ? t : n[t]).apply(n, r)
        })
    }, h.pluck = function(n, t) {
        return h.map(n, h.property(t))
    }, h.where = function(n, t) {
        return h.filter(n, h.matches(t))
    }, h.findWhere = function(n, t) {
        return h.find(n, h.matches(t))
    }, h.max = function(n, t, r) {
        var e, u, i = -1 / 0,
            a = -1 / 0;
        if (null == t && null != n) {
            n = n.length === +n.length ? n : h.values(n);
            for (var o = 0, l = n.length; l > o; o++) e = n[o], e > i && (i = e)
        } else t = h.iteratee(t, r), h.each(n, function(n, r, e) {
            u = t(n, r, e), (u > a || u === -1 / 0 && i === -1 / 0) && (i = n, a = u)
        });
        return i
    }, h.min = function(n, t, r) {
        var e, u, i = 1 / 0,
            a = 1 / 0;
        if (null == t && null != n) {
            n = n.length === +n.length ? n : h.values(n);
            for (var o = 0, l = n.length; l > o; o++) e = n[o], i > e && (i = e)
        } else t = h.iteratee(t, r), h.each(n, function(n, r, e) {
            u = t(n, r, e), (a > u || 1 / 0 === u && 1 / 0 === i) && (i = n, a = u)
        });
        return i
    }, h.shuffle = function(n) {
        for (var t, r = n && n.length === +n.length ? n : h.values(n), e = r.length, u = Array(e), i = 0; e > i; i++) t = h.random(0, i), t !== i && (u[i] = u[t]), u[t] = r[i];
        return u
    }, h.sample = function(n, t, r) {
        return null == t || r ? (n.length !== +n.length && (n = h.values(n)), n[h.random(n.length - 1)]) : h.shuffle(n).slice(0, Math.max(0, t))
    }, h.sortBy = function(n, t, r) {
        return t = h.iteratee(t, r), h.pluck(h.map(n, function(n, r, e) {
            return {
                value: n,
                index: r,
                criteria: t(n, r, e)
            }
        }).sort(function(n, t) {
            var r = n.criteria,
                e = t.criteria;
            if (r !== e) {
                if (r > e || r === void 0) return 1;
                if (e > r || e === void 0) return -1
            }
            return n.index - t.index
        }), "value")
    };
    var m = function(n) {
        return function(t, r, e) {
            var u = {};
            return r = h.iteratee(r, e), h.each(t, function(e, i) {
                var a = r(e, i, t);
                n(u, e, a)
            }), u
        }
    };
    h.groupBy = m(function(n, t, r) {
        h.has(n, r) ? n[r].push(t) : n[r] = [t]
    }), h.indexBy = m(function(n, t, r) {
        n[r] = t
    }), h.countBy = m(function(n, t, r) {
        h.has(n, r) ? n[r]++ : n[r] = 1
    }), h.sortedIndex = function(n, t, r, e) {
        r = h.iteratee(r, e, 1);
        for (var u = r(t), i = 0, a = n.length; a > i;) {
            var o = i + a >>> 1;
            r(n[o]) < u ? i = o + 1 : a = o
        }
        return i
    }, h.toArray = function(n) {
        return n ? h.isArray(n) ? a.call(n) : n.length === +n.length ? h.map(n, h.identity) : h.values(n) : []
    }, h.size = function(n) {
        return null == n ? 0 : n.length === +n.length ? n.length : h.keys(n).length
    }, h.partition = function(n, t, r) {
        t = h.iteratee(t, r);
        var e = [],
            u = [];
        return h.each(n, function(n, r, i) {
            (t(n, r, i) ? e : u).push(n)
        }), [e, u]
    }, h.first = h.head = h.take = function(n, t, r) {
        return null == n ? void 0 : null == t || r ? n[0] : 0 > t ? [] : a.call(n, 0, t)
    }, h.initial = function(n, t, r) {
        return a.call(n, 0, Math.max(0, n.length - (null == t || r ? 1 : t)))
    }, h.last = function(n, t, r) {
        return null == n ? void 0 : null == t || r ? n[n.length - 1] : a.call(n, Math.max(n.length - t, 0))
    }, h.rest = h.tail = h.drop = function(n, t, r) {
        return a.call(n, null == t || r ? 1 : t)
    }, h.compact = function(n) {
        return h.filter(n, h.identity)
    };
    var y = function(n, t, r, e) {
        if (t && h.every(n, h.isArray)) return o.apply(e, n);
        for (var u = 0, a = n.length; a > u; u++) {
            var l = n[u];
            h.isArray(l) || h.isArguments(l) ? t ? i.apply(e, l) : y(l, t, r, e) : r || e.push(l)
        }
        return e
    };
    h.flatten = function(n, t) {
        return y(n, t, !1, [])
    }, h.without = function(n) {
        return h.difference(n, a.call(arguments, 1))
    }, h.uniq = h.unique = function(n, t, r, e) {
        if (null == n) return [];
        h.isBoolean(t) || (e = r, r = t, t = !1), null != r && (r = h.iteratee(r, e));
        for (var u = [], i = [], a = 0, o = n.length; o > a; a++) {
            var l = n[a];
            if (t) a && i === l || u.push(l), i = l;
            else if (r) {
                var c = r(l, a, n);
                h.indexOf(i, c) < 0 && (i.push(c), u.push(l))
            } else h.indexOf(u, l) < 0 && u.push(l)
        }
        return u
    }, h.union = function() {
        return h.uniq(y(arguments, !0, !0, []))
    }, h.intersection = function(n) {
        if (null == n) return [];
        for (var t = [], r = arguments.length, e = 0, u = n.length; u > e; e++) {
            var i = n[e];
            if (!h.contains(t, i)) {
                for (var a = 1; r > a && h.contains(arguments[a], i); a++);
                a === r && t.push(i)
            }
        }
        return t
    }, h.difference = function(n) {
        var t = y(a.call(arguments, 1), !0, !0, []);
        return h.filter(n, function(n) {
            return !h.contains(t, n)
        })
    }, h.zip = function(n) {
        if (null == n) return [];
        for (var t = h.max(arguments, "length").length, r = Array(t), e = 0; t > e; e++) r[e] = h.pluck(arguments, e);
        return r
    }, h.object = function(n, t) {
        if (null == n) return {};
        for (var r = {}, e = 0, u = n.length; u > e; e++) t ? r[n[e]] = t[e] : r[n[e][0]] = n[e][1];
        return r
    }, h.indexOf = function(n, t, r) {
        if (null == n) return -1;
        var e = 0,
            u = n.length;
        if (r) {
            if ("number" != typeof r) return e = h.sortedIndex(n, t), n[e] === t ? e : -1;
            e = 0 > r ? Math.max(0, u + r) : r
        }
        for (; u > e; e++)
            if (n[e] === t) return e;
        return -1
    }, h.lastIndexOf = function(n, t, r) {
        if (null == n) return -1;
        var e = n.length;
        for ("number" == typeof r && (e = 0 > r ? e + r + 1 : Math.min(e, r + 1)); --e >= 0;)
            if (n[e] === t) return e;
        return -1
    }, h.range = function(n, t, r) {
        arguments.length <= 1 && (t = n || 0, n = 0), r = r || 1;
        for (var e = Math.max(Math.ceil((t - n) / r), 0), u = Array(e), i = 0; e > i; i++, n += r) u[i] = n;
        return u
    };
    var d = function() {};
    h.bind = function(n, t) {
        var r, e;
        if (p && n.bind === p) return p.apply(n, a.call(arguments, 1));
        if (!h.isFunction(n)) throw new TypeError("Bind must be called on a function");
        return r = a.call(arguments, 2), e = function() {
            if (!(this instanceof e)) return n.apply(t, r.concat(a.call(arguments)));
            d.prototype = n.prototype;
            var u = new d;
            d.prototype = null;
            var i = n.apply(u, r.concat(a.call(arguments)));
            return h.isObject(i) ? i : u
        }
    }, h.partial = function(n) {
        var t = a.call(arguments, 1);
        return function() {
            for (var r = 0, e = t.slice(), u = 0, i = e.length; i > u; u++) e[u] === h && (e[u] = arguments[r++]);
            for (; r < arguments.length;) e.push(arguments[r++]);
            return n.apply(this, e)
        }
    }, h.bindAll = function(n) {
        var t, r, e = arguments.length;
        if (1 >= e) throw new Error("bindAll must be passed function names");
        for (t = 1; e > t; t++) r = arguments[t], n[r] = h.bind(n[r], n);
        return n
    }, h.memoize = function(n, t) {
        var r = function(e) {
            var u = r.cache,
                i = t ? t.apply(this, arguments) : e;
            return h.has(u, i) || (u[i] = n.apply(this, arguments)), u[i]
        };
        return r.cache = {}, r
    }, h.delay = function(n, t) {
        var r = a.call(arguments, 2);
        return setTimeout(function() {
            return n.apply(null, r)
        }, t)
    }, h.defer = function(n) {
        return h.delay.apply(h, [n, 1].concat(a.call(arguments, 1)))
    }, h.throttle = function(n, t, r) {
        var e, u, i, a = null,
            o = 0;
        r || (r = {});
        var l = function() {
            o = r.leading === !1 ? 0 : h.now(), a = null, i = n.apply(e, u), a || (e = u = null)
        };
        return function() {
            var c = h.now();
            o || r.leading !== !1 || (o = c);
            var f = t - (c - o);
            return e = this, u = arguments, 0 >= f || f > t ? (clearTimeout(a), a = null, o = c, i = n.apply(e, u), a || (e = u = null)) : a || r.trailing === !1 || (a = setTimeout(l, f)), i
        }
    }, h.debounce = function(n, t, r) {
        var e, u, i, a, o, l = function() {
            var c = h.now() - a;
            t > c && c > 0 ? e = setTimeout(l, t - c) : (e = null, r || (o = n.apply(i, u), e || (i = u = null)))
        };
        return function() {
            i = this, u = arguments, a = h.now();
            var c = r && !e;
            return e || (e = setTimeout(l, t)), c && (o = n.apply(i, u), i = u = null), o
        }
    }, h.wrap = function(n, t) {
        return h.partial(t, n)
    }, h.negate = function(n) {
        return function() {
            return !n.apply(this, arguments)
        }
    }, h.compose = function() {
        var n = arguments,
            t = n.length - 1;
        return function() {
            for (var r = t, e = n[t].apply(this, arguments); r--;) e = n[r].call(this, e);
            return e
        }
    }, h.after = function(n, t) {
        return function() {
            return --n < 1 ? t.apply(this, arguments) : void 0
        }
    }, h.before = function(n, t) {
        var r;
        return function() {
            return --n > 0 ? r = t.apply(this, arguments) : t = null, r
        }
    }, h.once = h.partial(h.before, 2), h.keys = function(n) {
        if (!h.isObject(n)) return [];
        if (s) return s(n);
        var t = [];
        for (var r in n) h.has(n, r) && t.push(r);
        return t
    }, h.values = function(n) {
        for (var t = h.keys(n), r = t.length, e = Array(r), u = 0; r > u; u++) e[u] = n[t[u]];
        return e
    }, h.pairs = function(n) {
        for (var t = h.keys(n), r = t.length, e = Array(r), u = 0; r > u; u++) e[u] = [t[u], n[t[u]]];
        return e
    }, h.invert = function(n) {
        for (var t = {}, r = h.keys(n), e = 0, u = r.length; u > e; e++) t[n[r[e]]] = r[e];
        return t
    }, h.functions = h.methods = function(n) {
        var t = [];
        for (var r in n) h.isFunction(n[r]) && t.push(r);
        return t.sort()
    }, h.extend = function(n) {
        if (!h.isObject(n)) return n;
        for (var t, r, e = 1, u = arguments.length; u > e; e++) {
            t = arguments[e];
            for (r in t) c.call(t, r) && (n[r] = t[r])
        }
        return n
    }, h.pick = function(n, t, r) {
        var e, u = {};
        if (null == n) return u;
        if (h.isFunction(t)) {
            t = g(t, r);
            for (e in n) {
                var i = n[e];
                t(i, e, n) && (u[e] = i)
            }
        } else {
            var l = o.apply([], a.call(arguments, 1));
            n = new Object(n);
            for (var c = 0, f = l.length; f > c; c++) e = l[c], e in n && (u[e] = n[e])
        }
        return u
    }, h.omit = function(n, t, r) {
        if (h.isFunction(t)) t = h.negate(t);
        else {
            var e = h.map(o.apply([], a.call(arguments, 1)), String);
            t = function(n, t) {
                return !h.contains(e, t)
            }
        }
        return h.pick(n, t, r)
    }, h.defaults = function(n) {
        if (!h.isObject(n)) return n;
        for (var t = 1, r = arguments.length; r > t; t++) {
            var e = arguments[t];
            for (var u in e) n[u] === void 0 && (n[u] = e[u])
        }
        return n
    }, h.clone = function(n) {
        return h.isObject(n) ? h.isArray(n) ? n.slice() : h.extend({}, n) : n
    }, h.tap = function(n, t) {
        return t(n), n
    };
    var b = function(n, t, r, e) {
        if (n === t) return 0 !== n || 1 / n === 1 / t;
        if (null == n || null == t) return n === t;
        n instanceof h && (n = n._wrapped), t instanceof h && (t = t._wrapped);
        var u = l.call(n);
        if (u !== l.call(t)) return !1;
        switch (u) {
            case "[object RegExp]":
            case "[object String]":
                return "" + n == "" + t;
            case "[object Number]":
                return +n !== +n ? +t !== +t : 0 === +n ? 1 / +n === 1 / t : +n === +t;
            case "[object Date]":
            case "[object Boolean]":
                return +n === +t
        }
        if ("object" != typeof n || "object" != typeof t) return !1;
        for (var i = r.length; i--;)
            if (r[i] === n) return e[i] === t;
        var a = n.constructor,
            o = t.constructor;
        if (a !== o && "constructor" in n && "constructor" in t && !(h.isFunction(a) && a instanceof a && h.isFunction(o) && o instanceof o)) return !1;
        r.push(n), e.push(t);
        var c, f;
        if ("[object Array]" === u) {
            if (c = n.length, f = c === t.length)
                for (; c-- && (f = b(n[c], t[c], r, e)););
        } else {
            var s, p = h.keys(n);
            if (c = p.length, f = h.keys(t).length === c)
                for (; c-- && (s = p[c], f = h.has(t, s) && b(n[s], t[s], r, e)););
        }
        return r.pop(), e.pop(), f
    };
    h.isEqual = function(n, t) {
        return b(n, t, [], [])
    }, h.isEmpty = function(n) {
        if (null == n) return !0;
        if (h.isArray(n) || h.isString(n) || h.isArguments(n)) return 0 === n.length;
        for (var t in n)
            if (h.has(n, t)) return !1;
        return !0
    }, h.isElement = function(n) {
        return !(!n || 1 !== n.nodeType)
    }, h.isArray = f || function(n) {
        return "[object Array]" === l.call(n)
    }, h.isObject = function(n) {
        var t = typeof n;
        return "function" === t || "object" === t && !!n
    }, h.each(["Arguments", "Function", "String", "Number", "Date", "RegExp"], function(n) {
        h["is" + n] = function(t) {
            return l.call(t) === "[object " + n + "]"
        }
    }), h.isArguments(arguments) || (h.isArguments = function(n) {
        return h.has(n, "callee")
    }), "function" != typeof /./ && (h.isFunction = function(n) {
        return "function" == typeof n || !1
    }), h.isFinite = function(n) {
        return isFinite(n) && !isNaN(parseFloat(n))
    }, h.isNaN = function(n) {
        return h.isNumber(n) && n !== +n
    }, h.isBoolean = function(n) {
        return n === !0 || n === !1 || "[object Boolean]" === l.call(n)
    }, h.isNull = function(n) {
        return null === n
    }, h.isUndefined = function(n) {
        return n === void 0
    }, h.has = function(n, t) {
        return null != n && c.call(n, t)
    }, h.noConflict = function() {
        return n._ = t, this
    }, h.identity = function(n) {
        return n
    }, h.constant = function(n) {
        return function() {
            return n
        }
    }, h.noop = function() {}, h.property = function(n) {
        return function(t) {
            return t[n]
        }
    }, h.matches = function(n) {
        var t = h.pairs(n),
            r = t.length;
        return function(n) {
            if (null == n) return !r;
            n = new Object(n);
            for (var e = 0; r > e; e++) {
                var u = t[e],
                    i = u[0];
                if (u[1] !== n[i] || !(i in n)) return !1
            }
            return !0
        }
    }, h.times = function(n, t, r) {
        var e = Array(Math.max(0, n));
        t = g(t, r, 1);
        for (var u = 0; n > u; u++) e[u] = t(u);
        return e
    }, h.random = function(n, t) {
        return null == t && (t = n, n = 0), n + Math.floor(Math.random() * (t - n + 1))
    }, h.now = Date.now || function() {
        return (new Date).getTime()
    };
    var _ = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#x27;",
            "`": "&#x60;"
        },
        w = h.invert(_),
        j = function(n) {
            var t = function(t) {
                    return n[t]
                },
                r = "(?:" + h.keys(n).join("|") + ")",
                e = RegExp(r),
                u = RegExp(r, "g");
            return function(n) {
                return n = null == n ? "" : "" + n, e.test(n) ? n.replace(u, t) : n
            }
        };
    h.escape = j(_), h.unescape = j(w), h.result = function(n, t) {
        if (null == n) return void 0;
        var r = n[t];
        return h.isFunction(r) ? n[t]() : r
    };
    var x = 0;
    h.uniqueId = function(n) {
        var t = ++x + "";
        return n ? n + t : t
    }, h.templateSettings = {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g,
        escape: /<%-([\s\S]+?)%>/g
    };
    var A = /(.)^/,
        k = {
            "'": "'",
            "\\": "\\",
            "\r": "r",
            "\n": "n",
            "\u2028": "u2028",
            "\u2029": "u2029"
        },
        O = /\\|'|\r|\n|\u2028|\u2029/g,
        F = function(n) {
            return "\\" + k[n]
        };
    h.template = function(n, t, r) {
        !t && r && (t = r), t = h.defaults({}, t, h.templateSettings);
        var e = RegExp([(t.escape || A).source, (t.interpolate || A).source, (t.evaluate || A).source].join("|") + "|$", "g"),
            u = 0,
            i = "__p+='";
        n.replace(e, function(t, r, e, a, o) {
            return i += n.slice(u, o).replace(O, F), u = o + t.length, r ? i += "'+\n((__t=(" + r + "))==null?'':_.escape(__t))+\n'" : e ? i += "'+\n((__t=(" + e + "))==null?'':__t)+\n'" : a && (i += "';\n" + a + "\n__p+='"), t
        }), i += "';\n", t.variable || (i = "with(obj||{}){\n" + i + "}\n"), i = "var __t,__p='',__j=Array.prototype.join," + "print=function(){__p+=__j.call(arguments,'');};\n" + i + "return __p;\n";
        try {
            var a = new Function(t.variable || "obj", "_", i)
        } catch (o) {
            throw o.source = i, o
        }
        var l = function(n) {
                return a.call(this, n, h)
            },
            c = t.variable || "obj";
        return l.source = "function(" + c + "){\n" + i + "}", l
    }, h.chain = function(n) {
        var t = h(n);
        return t._chain = !0, t
    };
    var E = function(n) {
        return this._chain ? h(n).chain() : n
    };
    h.mixin = function(n) {
        h.each(h.functions(n), function(t) {
            var r = h[t] = n[t];
            h.prototype[t] = function() {
                var n = [this._wrapped];
                return i.apply(n, arguments), E.call(this, r.apply(h, n))
            }
        })
    }, h.mixin(h), h.each(["pop", "push", "reverse", "shift", "sort", "splice", "unshift"], function(n) {
        var t = r[n];
        h.prototype[n] = function() {
            var r = this._wrapped;
            return t.apply(r, arguments), "shift" !== n && "splice" !== n || 0 !== r.length || delete r[0], E.call(this, r)
        }
    }), h.each(["concat", "join", "slice"], function(n) {
        var t = r[n];
        h.prototype[n] = function() {
            return E.call(this, t.apply(this._wrapped, arguments))
        }
    }), h.prototype.value = function() {
        return this._wrapped
    }, "function" == typeof define && define.amd && define("underscore", [], function() {
        return h
    })
}).call(this);
(function(a) {
    if (typeof define === "function" && define.amd && define.amd.jQuery) {
        define(["jquery"], a)
    } else {
        a(jQuery)
    }
}(function(f) {
    var p = "left",
        o = "right",
        e = "up",
        x = "down",
        c = "in",
        z = "out",
        m = "none",
        s = "auto",
        l = "swipe",
        t = "pinch",
        A = "tap",
        j = "doubletap",
        b = "longtap",
        y = "hold",
        D = "horizontal",
        u = "vertical",
        i = "all",
        r = 10,
        g = "start",
        k = "move",
        h = "end",
        q = "cancel",
        a = "ontouchstart" in window,
        v = window.navigator.msPointerEnabled && !window.navigator.pointerEnabled,
        d = window.navigator.pointerEnabled || window.navigator.msPointerEnabled,
        B = "TouchSwipe";
    var n = {
        fingers: 1,
        threshold: 75,
        cancelThreshold: null,
        pinchThreshold: 20,
        maxTimeThreshold: null,
        fingerReleaseThreshold: 250,
        longTapThreshold: 500,
        doubleTapThreshold: 200,
        swipe: null,
        swipeLeft: null,
        swipeRight: null,
        swipeUp: null,
        swipeDown: null,
        swipeStatus: null,
        pinchIn: null,
        pinchOut: null,
        pinchStatus: null,
        click: null,
        tap: null,
        doubleTap: null,
        longTap: null,
        hold: null,
        triggerOnTouchEnd: true,
        triggerOnTouchLeave: false,
        allowPageScroll: "auto",
        fallbackToMouseEvents: true,
        excludedElements: "label, button, input, select, textarea, a, .noSwipe"
    };
    f.fn.swipe = function(G) {
        var F = f(this),
            E = F.data(B);
        if (E && typeof G === "string") {
            if (E[G]) {
                return E[G].apply(this, Array.prototype.slice.call(arguments, 1))
            } else {
                f.error("Method " + G + " does not exist on jQuery.swipe")
            }
        } else {
            if (!E && (typeof G === "object" || !G)) {
                return w.apply(this, arguments)
            }
        }
        return F
    };
    f.fn.swipe.defaults = n;
    f.fn.swipe.phases = {
        PHASE_START: g,
        PHASE_MOVE: k,
        PHASE_END: h,
        PHASE_CANCEL: q
    };
    f.fn.swipe.directions = {
        LEFT: p,
        RIGHT: o,
        UP: e,
        DOWN: x,
        IN: c,
        OUT: z
    };
    f.fn.swipe.pageScroll = {
        NONE: m,
        HORIZONTAL: D,
        VERTICAL: u,
        AUTO: s
    };
    f.fn.swipe.fingers = {
        ONE: 1,
        TWO: 2,
        THREE: 3,
        ALL: i
    };

    function w(E) {
        if (E && (E.allowPageScroll === undefined && (E.swipe !== undefined || E.swipeStatus !== undefined))) {
            E.allowPageScroll = m
        }
        if (E.click !== undefined && E.tap === undefined) {
            E.tap = E.click
        }
        if (!E) {
            E = {}
        }
        E = f.extend({}, f.fn.swipe.defaults, E);
        return this.each(function() {
            var G = f(this);
            var F = G.data(B);
            if (!F) {
                F = new C(this, E);
                G.data(B, F)
            }
        })
    }

    function C(a4, av) {
        var az = (a || d || !av.fallbackToMouseEvents),
            J = az ? (d ? (v ? "MSPointerDown" : "pointerdown") : "touchstart") : "mousedown",
            ay = az ? (d ? (v ? "MSPointerMove" : "pointermove") : "touchmove") : "mousemove",
            U = az ? (d ? (v ? "MSPointerUp" : "pointerup") : "touchend") : "mouseup",
            S = az ? null : "mouseleave",
            aD = (d ? (v ? "MSPointerCancel" : "pointercancel") : "touchcancel");
        var ag = 0,
            aP = null,
            ab = 0,
            a1 = 0,
            aZ = 0,
            G = 1,
            aq = 0,
            aJ = 0,
            M = null;
        var aR = f(a4);
        var Z = "start";
        var W = 0;
        var aQ = null;
        var T = 0,
            a2 = 0,
            a5 = 0,
            ad = 0,
            N = 0;
        var aW = null,
            af = null;
        try {
            aR.bind(J, aN);
            aR.bind(aD, a9)
        } catch (ak) {
            f.error("events not supported " + J + "," + aD + " on jQuery.swipe")
        }
        this.enable = function() {
            aR.bind(J, aN);
            aR.bind(aD, a9);
            return aR
        };
        this.disable = function() {
            aK();
            return aR
        };
        this.destroy = function() {
            aK();
            aR.data(B, null);
            return aR
        };
        this.option = function(bc, bb) {
            if (av[bc] !== undefined) {
                if (bb === undefined) {
                    return av[bc]
                } else {
                    av[bc] = bb
                }
            } else {
                f.error("Option " + bc + " does not exist on jQuery.swipe.options")
            }
            return null
        };

        function aN(bd) {
            if (aB()) {
                return
            }
            if (f(bd.target).closest(av.excludedElements, aR).length > 0) {
                return
            }
            var be = bd.originalEvent ? bd.originalEvent : bd;
            var bc, bb = a ? be.touches[0] : be;
            Z = g;
            if (a) {
                W = be.touches.length
            } else {
                bd.preventDefault()
            }
            ag = 0;
            aP = null;
            aJ = null;
            ab = 0;
            a1 = 0;
            aZ = 0;
            G = 1;
            aq = 0;
            aQ = aj();
            M = aa();
            R();
            if (!a || (W === av.fingers || av.fingers === i) || aX()) {
                ai(0, bb);
                T = at();
                if (W == 2) {
                    ai(1, be.touches[1]);
                    a1 = aZ = au(aQ[0].start, aQ[1].start)
                }
                if (av.swipeStatus || av.pinchStatus) {
                    bc = O(be, Z)
                }
            } else {
                bc = false
            }
            if (bc === false) {
                Z = q;
                O(be, Z);
                return bc
            } else {
                if (av.hold) {
                    af = setTimeout(f.proxy(function() {
                        aR.trigger("hold", [be.target]);
                        if (av.hold) {
                            bc = av.hold.call(aR, be, be.target)
                        }
                    }, this), av.longTapThreshold)
                }
                ao(true)
            }
            return null
        }

        function a3(be) {
            var bh = be.originalEvent ? be.originalEvent : be;
            if (Z === h || Z === q || am()) {
                return
            }
            var bd, bc = a ? bh.touches[0] : bh;
            var bf = aH(bc);
            a2 = at();
            if (a) {
                W = bh.touches.length
            }
            if (av.hold) {
                clearTimeout(af)
            }
            Z = k;
            if (W == 2) {
                if (a1 == 0) {
                    ai(1, bh.touches[1]);
                    a1 = aZ = au(aQ[0].start, aQ[1].start)
                } else {
                    aH(bh.touches[1]);
                    aZ = au(aQ[0].end, aQ[1].end);
                    aJ = ar(aQ[0].end, aQ[1].end)
                }
                G = a7(a1, aZ);
                aq = Math.abs(a1 - aZ)
            }
            if ((W === av.fingers || av.fingers === i) || !a || aX()) {
                aP = aL(bf.start, bf.end);
                al(be, aP);
                ag = aS(bf.start, bf.end);
                ab = aM();
                aI(aP, ag);
                if (av.swipeStatus || av.pinchStatus) {
                    bd = O(bh, Z)
                }
                if (!av.triggerOnTouchEnd || av.triggerOnTouchLeave) {
                    var bb = true;
                    if (av.triggerOnTouchLeave) {
                        var bg = aY(this);
                        bb = E(bf.end, bg)
                    }
                    if (!av.triggerOnTouchEnd && bb) {
                        Z = aC(k)
                    } else {
                        if (av.triggerOnTouchLeave && !bb) {
                            Z = aC(h)
                        }
                    }
                    if (Z == q || Z == h) {
                        O(bh, Z)
                    }
                }
            } else {
                Z = q;
                O(bh, Z)
            }
            if (bd === false) {
                Z = q;
                O(bh, Z)
            }
        }

        function L(bb) {
            var bc = bb.originalEvent;
            if (a) {
                if (bc.touches.length > 0) {
                    F();
                    return true
                }
            }
            if (am()) {
                W = ad
            }
            a2 = at();
            ab = aM();
            if (ba() || !an()) {
                Z = q;
                O(bc, Z)
            } else {
                if (av.triggerOnTouchEnd || (av.triggerOnTouchEnd == false && Z === k)) {
                    bb.preventDefault();
                    Z = h;
                    O(bc, Z)
                } else {
                    if (!av.triggerOnTouchEnd && a6()) {
                        Z = h;
                        aF(bc, Z, A)
                    } else {
                        if (Z === k) {
                            Z = q;
                            O(bc, Z)
                        }
                    }
                }
            }
            ao(false);
            return null
        }

        function a9() {
            W = 0;
            a2 = 0;
            T = 0;
            a1 = 0;
            aZ = 0;
            G = 1;
            R();
            ao(false)
        }

        function K(bb) {
            var bc = bb.originalEvent;
            if (av.triggerOnTouchLeave) {
                Z = aC(h);
                O(bc, Z)
            }
        }

        function aK() {
            aR.unbind(J, aN);
            aR.unbind(aD, a9);
            aR.unbind(ay, a3);
            aR.unbind(U, L);
            if (S) {
                aR.unbind(S, K)
            }
            ao(false)
        }

        function aC(bf) {
            var be = bf;
            var bd = aA();
            var bc = an();
            var bb = ba();
            if (!bd || bb) {
                be = q
            } else {
                if (bc && bf == k && (!av.triggerOnTouchEnd || av.triggerOnTouchLeave)) {
                    be = h
                } else {
                    if (!bc && bf == h && av.triggerOnTouchLeave) {
                        be = q
                    }
                }
            }
            return be
        }

        function O(bd, bb) {
            var bc = undefined;
            if (I() || V()) {
                bc = aF(bd, bb, l)
            } else {
                if ((P() || aX()) && bc !== false) {
                    bc = aF(bd, bb, t)
                }
            }
            if (aG() && bc !== false) {
                bc = aF(bd, bb, j)
            } else {
                if (ap() && bc !== false) {
                    bc = aF(bd, bb, b)
                } else {
                    if (ah() && bc !== false) {
                        bc = aF(bd, bb, A)
                    }
                }
            }
            if (bb === q) {
                a9(bd)
            }
            if (bb === h) {
                if (a) {
                    if (bd.touches.length == 0) {
                        a9(bd)
                    }
                } else {
                    a9(bd)
                }
            }
            return bc
        }

        function aF(be, bb, bd) {
            var bc = undefined;
            if (bd == l) {
                aR.trigger("swipeStatus", [bb, aP || null, ag || 0, ab || 0, W, aQ]);
                if (av.swipeStatus) {
                    bc = av.swipeStatus.call(aR, be, bb, aP || null, ag || 0, ab || 0, W, aQ);
                    if (bc === false) {
                        return false
                    }
                }
                if (bb == h && aV()) {
                    aR.trigger("swipe", [aP, ag, ab, W, aQ]);
                    if (av.swipe) {
                        bc = av.swipe.call(aR, be, aP, ag, ab, W, aQ);
                        if (bc === false) {
                            return false
                        }
                    }
                    switch (aP) {
                        case p:
                            aR.trigger("swipeLeft", [aP, ag, ab, W, aQ]);
                            if (av.swipeLeft) {
                                bc = av.swipeLeft.call(aR, be, aP, ag, ab, W, aQ)
                            }
                            break;
                        case o:
                            aR.trigger("swipeRight", [aP, ag, ab, W, aQ]);
                            if (av.swipeRight) {
                                bc = av.swipeRight.call(aR, be, aP, ag, ab, W, aQ)
                            }
                            break;
                        case e:
                            aR.trigger("swipeUp", [aP, ag, ab, W, aQ]);
                            if (av.swipeUp) {
                                bc = av.swipeUp.call(aR, be, aP, ag, ab, W, aQ)
                            }
                            break;
                        case x:
                            aR.trigger("swipeDown", [aP, ag, ab, W, aQ]);
                            if (av.swipeDown) {
                                bc = av.swipeDown.call(aR, be, aP, ag, ab, W, aQ)
                            }
                            break
                    }
                }
            }
            if (bd == t) {
                aR.trigger("pinchStatus", [bb, aJ || null, aq || 0, ab || 0, W, G, aQ]);
                if (av.pinchStatus) {
                    bc = av.pinchStatus.call(aR, be, bb, aJ || null, aq || 0, ab || 0, W, G, aQ);
                    if (bc === false) {
                        return false
                    }
                }
                if (bb == h && a8()) {
                    switch (aJ) {
                        case c:
                            aR.trigger("pinchIn", [aJ || null, aq || 0, ab || 0, W, G, aQ]);
                            if (av.pinchIn) {
                                bc = av.pinchIn.call(aR, be, aJ || null, aq || 0, ab || 0, W, G, aQ)
                            }
                            break;
                        case z:
                            aR.trigger("pinchOut", [aJ || null, aq || 0, ab || 0, W, G, aQ]);
                            if (av.pinchOut) {
                                bc = av.pinchOut.call(aR, be, aJ || null, aq || 0, ab || 0, W, G, aQ)
                            }
                            break
                    }
                }
            }
            
            return bc
        }

        function an() {
            var bb = true;
            if (av.threshold !== null) {
                bb = ag >= av.threshold
            }
            return bb
        }

        function ba() {
            var bb = false;
            if (av.cancelThreshold !== null && aP !== null) {
                bb = (aT(aP) - ag) >= av.cancelThreshold
            }
            return bb
        }

        function ae() {
            if (av.pinchThreshold !== null) {
                return aq >= av.pinchThreshold
            }
            return true
        }

        function aA() {
            var bb;
            if (av.maxTimeThreshold) {
                if (ab >= av.maxTimeThreshold) {
                    bb = false
                } else {
                    bb = true
                }
            } else {
                bb = true
            }
            return bb
        }

        function al(bb, bc) {
            if (av.allowPageScroll === m || aX()) {
                //bb.preventDefault()
            } else {
                var bd = av.allowPageScroll === s;
                switch (bc) {
                    case p:
                        if ((av.swipeLeft && bd) || (!bd && av.allowPageScroll != D)) {
                            bb.preventDefault()
                        }
                        break;
                    case o:
                        if ((av.swipeRight && bd) || (!bd && av.allowPageScroll != D)) {
                            bb.preventDefault()
                        }
                        break;
                    case e:
                        if ((av.swipeUp && bd) || (!bd && av.allowPageScroll != u)) {
                            bb.preventDefault()
                        }
                        break;
                    case x:
                        if ((av.swipeDown && bd) || (!bd && av.allowPageScroll != u)) {
                            bb.preventDefault()
                        }
                        break
                }
            }
        }

        function a8() {
            var bc = aO();
            var bb = X();
            var bd = ae();
            return bc && bb && bd
        }

        function aX() {
            return !!(av.pinchStatus || av.pinchIn || av.pinchOut)
        }

        function P() {
            return !!(a8() && aX())
        }

        function aV() {
            var be = aA();
            var bg = an();
            var bd = aO();
            var bb = X();
            var bc = ba();
            var bf = !bc && bb && bd && bg && be;
            return bf
        }

        function V() {
            return !!(av.swipe || av.swipeStatus || av.swipeLeft || av.swipeRight || av.swipeUp || av.swipeDown)
        }

        function I() {
            return !!(aV() && V())
        }

        function aO() {
            return ((W === av.fingers || av.fingers === i) || !a)
        }

        function X() {
            return aQ[0].end.x !== 0
        }

        function a6() {
            return !!(av.tap)
        }

        function Y() {
            //return !!(av.doubleTap)
        }

        function aU() {
            return !!(av.longTap)
        }

        function Q() {
            if (N == null) {
                return false
            }
            var bb = at();
            //return (Y() && ((bb - N) <= av.doubleTapThreshold))
        }

        function H() {
            return Q()
        }

        function ax() {
            return ((W === 1 || !a) && (isNaN(ag) || ag < av.threshold))
        }

        function a0() {
            return ((ab > av.longTapThreshold) && (ag < r))
        }

        function ah() {
            return !!(ax() && a6())
        }

        function aG() {
            return !!(Q() && Y())
        }

        function ap() {
            return !!(a0() && aU())
        }

        function F() {
            a5 = at();
            ad = event.touches.length + 1
        }

        function R() {
            a5 = 0;
            ad = 0
        }

        function am() {
            var bb = false;
            if (a5) {
                var bc = at() - a5;
                if (bc <= av.fingerReleaseThreshold) {
                    bb = true
                }
            }
            return bb
        }

        function aB() {
            return !!(aR.data(B + "_intouch") === true)
        }

        function ao(bb) {
            if (bb === true) {
                aR.bind(ay, a3);
                aR.bind(U, L);
                if (S) {
                    aR.bind(S, K)
                }
            } else {
                aR.unbind(ay, a3, false);
                aR.unbind(U, L, false);
                if (S) {
                    aR.unbind(S, K, false)
                }
            }
            aR.data(B + "_intouch", bb === true)
        }

        function ai(bc, bb) {
            var bd = bb.identifier !== undefined ? bb.identifier : 0;
            aQ[bc].identifier = bd;
            aQ[bc].start.x = aQ[bc].end.x = bb.pageX || bb.clientX;
            aQ[bc].start.y = aQ[bc].end.y = bb.pageY || bb.clientY;
            return aQ[bc]
        }

        function aH(bb) {
            var bd = bb.identifier !== undefined ? bb.identifier : 0;
            var bc = ac(bd);
            bc.end.x = bb.pageX || bb.clientX;
            bc.end.y = bb.pageY || bb.clientY;
            return bc
        }

        function ac(bc) {
            for (var bb = 0; bb < aQ.length; bb++) {
                if (aQ[bb].identifier == bc) {
                    return aQ[bb]
                }
            }
        }

        function aj() {
            var bb = [];
            for (var bc = 0; bc <= 5; bc++) {
                bb.push({
                    start: {
                        x: 0,
                        y: 0
                    },
                    end: {
                        x: 0,
                        y: 0
                    },
                    identifier: 0
                })
            }
            return bb
        }

        function aI(bb, bc) {
            bc = Math.max(bc, aT(bb));
            M[bb].distance = bc
        }

        function aT(bb) {
            if (M[bb]) {
                return M[bb].distance
            }
            return undefined
        }

        function aa() {
            var bb = {};
            bb[p] = aw(p);
            bb[o] = aw(o);
            bb[e] = aw(e);
            bb[x] = aw(x);
            return bb
        }

        function aw(bb) {
            return {
                direction: bb,
                distance: 0
            }
        }

        function aM() {
            return a2 - T
        }

        function au(be, bd) {
            var bc = Math.abs(be.x - bd.x);
            var bb = Math.abs(be.y - bd.y);
            return Math.round(Math.sqrt(bc * bc + bb * bb))
        }

        function a7(bb, bc) {
            var bd = (bc / bb) * 1;
            return bd.toFixed(2)
        }

        function ar() {
            if (G < 1) {
                return z
            } else {
                return c
            }
        }

        function aS(bc, bb) {
            return Math.round(Math.sqrt(Math.pow(bb.x - bc.x, 2) + Math.pow(bb.y - bc.y, 2)))
        }

        function aE(be, bc) {
            var bb = be.x - bc.x;
            var bg = bc.y - be.y;
            var bd = Math.atan2(bg, bb);
            var bf = Math.round(bd * 180 / Math.PI);
            if (bf < 0) {
                bf = 360 - Math.abs(bf)
            }
            return bf
        }

        function aL(bc, bb) {
            var bd = aE(bc, bb);
            if ((bd <= 45) && (bd >= 0)) {
                return p
            } else {
                if ((bd <= 360) && (bd >= 315)) {
                    return p
                } else {
                    if ((bd >= 135) && (bd <= 225)) {
                        return o
                    } else {
                        if ((bd > 45) && (bd < 135)) {
                            return x
                        } else {
                            return e
                        }
                    }
                }
            }
        }

        function at() {
            var bb = new Date();
            return bb.getTime()
        }

        function aY(bb) {
            bb = f(bb);
            var bd = bb.offset();
            var bc = {
                left: bd.left,
                right: bd.left + bb.outerWidth(),
                top: bd.top,
                bottom: bd.top + bb.outerHeight()
            };
            return bc
        }

        function E(bb, bc) {
            return (bb.x > bc.left && bb.x < bc.right && bb.y > bc.top && bb.y < bc.bottom)
        }
    }
}));
$.easing.jswing = $.easing.swing;
(function($, ua) {
    var isChrome = /chrome/i.exec(ua),
        isAndroid = /android/i.exec(ua),
        hasTouch = 'ontouchstart' in window && !(isChrome && !isAndroid),
        startEvent = hasTouch ? 'touchstart' : 'mousedown',
        stopEvent = hasTouch ? 'touchend touchcancel' : 'mouseup mouseleave',
        moveEvent = hasTouch ? 'touchmove' : 'mousemove',
        namespace = 'finger',
        rootEl = $('html')[0],
        start = {},
        move = {},
        motion, cancel, safeguard, timeout, prevEl, prevTime, Finger = $.Finger = {
            pressDuration: 300,
            doubleTapInterval: 300,
            flickDuration: 150,
            motionThreshold: 5
        };

    function preventDefault(event) {
        event.preventDefault();
        $.event.remove(rootEl, 'click', preventDefault);
    }

    function page(coord, event) {
        return (hasTouch ? event.originalEvent.touches[0] : event)['page' + coord.toUpperCase()];
    }

    function trigger(event, evtName, remove) {
        var fingerEvent = $.Event(evtName, move);
        $.event.trigger(fingerEvent, {
            originalEvent: event
        }, event.target);
        if (fingerEvent.isDefaultPrevented()) {
            if (~evtName.indexOf('tap') && !hasTouch)
                $.event.add(rootEl, 'click', preventDefault);
            else
                event.preventDefault();
        }
        if (remove) {
            $.event.remove(rootEl, moveEvent + '.' + namespace, moveHandler);
            $.event.remove(rootEl, stopEvent + '.' + namespace, stopHandler);
        }
    }

    function startHandler(event) {
        var timeStamp = event.timeStamp || +new Date();
        if (safeguard == timeStamp) return;
        safeguard = timeStamp;
        start.x = move.x = page('x', event);
        start.y = move.y = page('y', event);
        start.time = timeStamp;
        start.target = event.target;
        move.orientation = null;
        move.end = false;
        motion = false;
        cancel = false;
        timeout = setTimeout(function() {
            cancel = true;
            trigger(event, 'press');
        }, $.Finger.pressDuration);
        $.event.add(rootEl, moveEvent + '.' + namespace, moveHandler);
        $.event.add(rootEl, stopEvent + '.' + namespace, stopHandler);
        if (Finger.preventDefault) {
            event.preventDefault();
            $.event.add(rootEl, 'click', preventDefault);
        }
    }

    function moveHandler(event) {
        move.x = page('x', event);
        move.y = page('y', event);
        move.dx = move.x - start.x;
        move.dy = move.y - start.y;
        move.adx = Math.abs(move.dx);
        move.ady = Math.abs(move.dy);
        motion = move.adx > Finger.motionThreshold || move.ady > Finger.motionThreshold;
        if (!motion) return;
        clearTimeout(timeout);
        if (!move.orientation) {
            if (move.adx > move.ady) {
                move.orientation = 'horizontal';
                move.direction = move.dx > 0 ? +1 : -1;
            } else {
                move.orientation = 'vertical';
                move.direction = move.dy > 0 ? +1 : -1;
            }
        }
        while (event.target && event.target !== start.target)
            event.target = event.target.parentNode;
        if (event.target !== start.target) {
            event.target = start.target;
            stopHandler.call(this, $.Event(stopEvent + '.' + namespace, event));
            return;
        }
        trigger(event, 'drag');
    }

    function stopHandler(event) {
        var timeStamp = event.timeStamp || +new Date(),
            dt = timeStamp - start.time,
            evtName;
        clearTimeout(timeout);
        if (!motion && !cancel && event.target === start.target) {
            var doubleTap = prevEl === event.target && timeStamp - prevTime < Finger.doubleTapInterval;
            evtName = doubleTap ? 'doubletap' : 'tap';
            prevEl = doubleTap ? null : start.target;
            prevTime = timeStamp;
        } else {
            event.target = start.target;
            if (dt < Finger.flickDuration) trigger(event, 'flick');
            move.end = true;
            evtName = 'drag';
        }
        trigger(event, evtName, true);
    }
    $.event.add(rootEl, startEvent + '.' + namespace, startHandler);
    $.each('tap doubletap press drag flick'.split(' '), function(i, name) {
        $.fn[name] = function(fn) {
            return fn ? this.on(name, fn) : this.trigger(name);
        };
    });
})(jQuery, navigator.userAgent);
$.extend($.easing, {
    def: 'easeOutQuad',
    swing: function(x, t, b, c, d) {
        return $.easing[$.easing.def](x, t, b, c, d);
    },
    easeInQuad: function(x, t, b, c, d) {
        return c * (t /= d) * t + b;
    },
    easeOutQuad: function(x, t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
    },
    easeInOutQuad: function(x, t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t + b;
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
    },
    easeInCubic: function(x, t, b, c, d) {
        return c * (t /= d) * t * t + b;
    },
    easeOutCubic: function(x, t, b, c, d) {
        return c * ((t = t / d - 1) * t * t + 1) + b;
    },
    easeInOutCubic: function(x, t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t + 2) + b;
    },
    easeInQuart: function(x, t, b, c, d) {
        return c * (t /= d) * t * t * t + b;
    },
    easeOutQuart: function(x, t, b, c, d) {
        return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    },
    easeInOutQuart: function(x, t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
        return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
    },
    easeInQuint: function(x, t, b, c, d) {
        return c * (t /= d) * t * t * t * t + b;
    },
    easeOutQuint: function(x, t, b, c, d) {
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    },
    easeInOutQuint: function(x, t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
    },
    easeInSine: function(x, t, b, c, d) {
        return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
    },
    easeOutSine: function(x, t, b, c, d) {
        return c * Math.sin(t / d * (Math.PI / 2)) + b;
    },
    easeInOutSine: function(x, t, b, c, d) {
        return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
    },
    easeInExpo: function(x, t, b, c, d) {
        return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
    },
    easeOutExpo: function(x, t, b, c, d) {
        return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
    },
    easeInOutExpo: function(x, t, b, c, d) {
        if (t == 0) return b;
        if (t == d) return b + c;
        if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
        return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
    },
    easeInCirc: function(x, t, b, c, d) {
        return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
    },
    easeOutCirc: function(x, t, b, c, d) {
        return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
    },
    easeInOutCirc: function(x, t, b, c, d) {
        if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
        return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
    },
    easeInElastic: function(x, t, b, c, d) {
        var s = 1.70158;
        var p = 0;
        var a = c;
        if (t == 0) return b;
        if ((t /= d) == 1) return b + c;
        if (!p) p = d * .3;
        if (a < Math.abs(c)) {
            a = c;
            var s = p / 4;
        } else var s = p / (2 * Math.PI) * Math.asin(c / a);
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
    },
    easeOutElastic: function(x, t, b, c, d) {
        var s = 1.70158;
        var p = 0;
        var a = c;
        if (t == 0) return b;
        if ((t /= d) == 1) return b + c;
        if (!p) p = d * .3;
        if (a < Math.abs(c)) {
            a = c;
            var s = p / 4;
        } else var s = p / (2 * Math.PI) * Math.asin(c / a);
        return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
    },
    easeInOutElastic: function(x, t, b, c, d) {
        var s = 1.70158;
        var p = 0;
        var a = c;
        if (t == 0) return b;
        if ((t /= d / 2) == 2) return b + c;
        if (!p) p = d * (.3 * 1.5);
        if (a < Math.abs(c)) {
            a = c;
            var s = p / 4;
        } else var s = p / (2 * Math.PI) * Math.asin(c / a);
        if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
    },
    easeInBack: function(x, t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        return c * (t /= d) * t * ((s + 1) * t - s) + b;
    },
    easeOutBack: function(x, t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    },
    easeInOutBack: function(x, t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
        return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
    },
    easeInBounce: function(x, t, b, c, d) {
        return c - $.easing.easeOutBounce(x, d - t, 0, c, d) + b;
    },
    easeOutBounce: function(x, t, b, c, d) {
        if ((t /= d) < (1 / 2.75)) {
            return c * (7.5625 * t * t) + b;
        } else if (t < (2 / 2.75)) {
            return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
        } else if (t < (2.5 / 2.75)) {
            return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
        } else {
            return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
        }
    },
    easeInOutBounce: function(x, t, b, c, d) {
        if (t < d / 2) return $.easing.easeInBounce(x, t * 2, 0, c, d) * .5 + b;
        return $.easing.easeOutBounce(x, t * 2 - d, 0, c, d) * .5 + c * .5 + b;
    }
});
/*!
 * jquery.imgpreloader.js
 *
 * @modified 2013/02/01
 * @requires jQuery 1.7.x or later
 * @version 1.1.4
 * @author FiNGAHOLiC
 * @link https://github.com/FiNGAHOLiC/jquery.imgpreloader
 * @license The MIT License
 *
 */
;
(function($, window, document, undefined) {
    $.imgpreloader = $.imgpreloader || function(options) {
        var o = $.extend({
            paths: []
        }, options);
        return $.Deferred(function(defer) {
            var loopCount = 0,
                pathLength = o.paths.length,
                $allImages = $(),
                $properImages = $(),
                $brokenImages = $(),
                $allOrderedImages = [],
                handler = function($image, isBroken) {
                    loopCount = loopCount + 1;
                    $allImages = $allImages.add($image);
                    defer.notify($image, $allImages, $properImages, $brokenImages, isBroken, Math.floor(loopCount / pathLength * 100));
                    if (loopCount === pathLength) {
                        if ($brokenImages.length) {
                            defer.reject($allImages, $properImages, $brokenImages);
                        } else {
                            defer.resolve($allImages, $allOrderedImages);
                        };
                    };
                };
            if (!$.isArray(o.paths) || !pathLength) {
                defer.reject();
            } else {
                $.each(o.paths, function(i, src) {
                    img = $('<img>')
                    img.on('load', function() {
                        var $image = $(this);
                        $properImages = $properImages.add($image);
                        handler($image, false);
                    }).on('error', function() {
                        var $image = $(this);
                        $brokenImages = $brokenImages.add($image);
                        handler($image, true);
                    }).attr('src', src);
                    $allOrderedImages.push(img.get(0))
                });
            };
        }).promise();
    };
})(jQuery, window, this.document);
(function(window, document, $, undefined) {
    var Version, BrowserInfo, PlatformInfo;
    Version = function(version) {
        this.original = null;
        this.major = null;
        this.minor = null;
        this.build = null;
        this.revision = null;
        this.initialize(version);
    };
    Version.prototype.initialize = function(version) {
        var arr = version.split('.');
        this.original = version;
        this.major = (arr && arr[0]) ? parseInt(arr[0], 10) : null;
        this.minor = (arr && arr[1]) ? parseInt(arr[1], 10) : null;
        this.build = (arr && arr[2]) ? parseInt(arr[2], 10) : null;
        this.revision = (arr && arr[3]) ? parseInt(arr[3], 10) : null;
    };
    Version.prototype.isEqual = function(major, minor, build, revision) {
        var res = false;
        if (typeof major === 'number' && this.major === major) {
            if (typeof minor === 'number' && this.minor === minor) {
                if (typeof build === 'number' && this.build === build) {
                    if (typeof revision === 'number' && this.revision === revision) {
                        res = true;
                    } else if (revision === undefined) {
                        res = true;
                    }
                } else if (build === undefined) {
                    res = true;
                }
            } else if (minor === undefined) {
                res = true;
            }
        }
        return res;
    };
    Version.prototype.isOrLess = function(major, minor, build, revision) {
        if (typeof major === 'number' && this.major < major) {
            return true;
        } else if (this.major === major) {
            if (typeof minor === 'number' && this.minor < minor) {
                return true;
            } else if (this.minor === minor) {
                if (typeof build === 'number' && this.build < build) {
                    return true;
                } else if (this.build === build) {
                    if (revision === undefined || (typeof revision === 'number' && this.revision <= revision)) {
                        return true;
                    } else {
                        return false;
                    }
                } else if (build === undefined) {
                    return true;
                } else {
                    return false;
                }
            } else if (minor === undefined) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    };
    Version.prototype.isLessThan = function(major, minor, build, revision) {
        if (typeof major === 'number' && this.major < major) {
            return true;
        } else if (this.major === major) {
            if (typeof minor === 'number' && this.minor < minor) {
                return true;
            } else if (this.minor === minor) {
                if (typeof build === 'number' && this.build < build) {
                    return true;
                } else if (this.build === build) {
                    if (typeof revision === 'number' && this.revision < revision) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
    };
    Version.prototype.isOrMore = function(major, minor, build, revision) {
        if (typeof major === 'number' && this.major > major) {
            return true;
        } else if (this.major === major) {
            if (typeof minor === 'number' && this.minor > minor) {
                return true;
            } else if (this.minor === minor) {
                if (typeof build === 'number' && this.build > build) {
                    return true;
                } else if (this.build === build) {
                    if (revision === undefined || (typeof revision === 'number' && this.revision >= revision)) {
                        return true;
                    } else {
                        return false;
                    }
                } else if (build === undefined) {
                    return true;
                } else {
                    return false;
                }
            } else if (minor === undefined) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    };
    Version.prototype.isMoreThan = function(major, minor, build, revision) {
        if (typeof major === 'number' && this.major > major) {
            return true;
        } else if (this.major === major) {
            if (typeof minor === 'number' && this.minor > minor) {
                return true;
            } else if (this.minor === minor) {
                if (typeof build === 'number' && this.build > build) {
                    return true;
                } else if (this.build === build) {
                    if (typeof revision === 'number' && this.revision > revision) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
    };
    Version.prototype.toString = function() {
        return this.original;
    };
    BrowserInfo = function() {
        this.original = '';
        this.version = null;
        this.initialize(window.navigator.userAgent);
    };
    BrowserInfo.prototype.initialize = function(userAgent) {
        var array;
        var browser = '';
        var engine = '';
        var architecture = '';
        var version = null;
        userAgent = userAgent.toLowerCase();
        if (userAgent.indexOf('opera') >= 0) {
            if (userAgent.indexOf('opera mini') >= 0) {
                browser = 'operamini';
                array = /opera mini\/([\d\.]+)/.exec(userAgent);
                version = (array) ? array[1] : '';
            } else if (userAgent.indexOf('opera mobi') >= 0) {
                browser = 'operamobile';
                array = /version\/([\d\.]+)/.exec(userAgent);
                version = (array) ? array[1] : '';
            } else {
                browser = 'opera';
                array = /opera[\s\/]+([\d\.]+)/.exec(userAgent);
                version = (array) ? array[1] : '';
            }
        } else if (userAgent.indexOf('msie') >= 0 || userAgent.indexOf('trident') >= 0) {
            browser = 'msie';
            array = /(msie|rv:?)\s?([\d\.]+)/.exec(userAgent);
            version = (array) ? array[2] : '';
        } else if (userAgent.indexOf('firefox') >= 0) {
            browser = 'firefox';
            array = /firefox\/([\d\.]+)/.exec(userAgent);
            version = (array) ? array[1] : '';
        } else if (userAgent.indexOf('chrome') >= 0 || userAgent.indexOf('crios') >= 0) {
            browser = 'chrome';
            array = /[chrome|crios]\/([\d\.]+)/.exec(userAgent);
            version = (array) ? array[1] : '';
        } else if (userAgent.indexOf('android') >= 0) {
            browser = 'browser';
            array = /version\/([\d\.]+)/.exec(userAgent);
            version = (array) ? array[1] : '';
        } else if (userAgent.indexOf('silk') >= 0) {
            browser = 'silk';
            array = /silk\/([\d\.]*)/.exec(userAgent);
            version = (array) ? array[1] : '';
        } else if (userAgent.indexOf('mercury') >= 0) {
            browser = 'mercury';
            array = /mercury\/([\d\.]+)/.exec(userAgent);
            version = (array) ? array[1] : '';
        } else if (userAgent.indexOf('safari') >= 0) {
            browser = 'safari';
            array = /version\/([\d\.]+)/.exec(userAgent);
            version = (array) ? array[1] : '';
        } else {
            browser = 'unknown';
            version = '';
        }
        if (userAgent.indexOf('webkit') >= 0) {
            engine = 'webkit';
        } else if (userAgent.indexOf('trident') >= 0) {
            engine = 'trident';
        } else if (userAgent.indexOf('presto') >= 0) {
            engine = 'presto';
        } else if (userAgent.indexOf('khtml') >= 0) {
            engine = 'khtml';
        } else if (userAgent.indexOf('gecko') >= 0) {
            engine = 'gecko';
        } else {
            engine = 'unknown';
        }
        if (userAgent.indexOf('arm') >= 0) {
            architecture = 'arm';
        } else if (userAgent.indexOf('win64') >= 0) {
            if (userAgent.indexOf('ia64') >= 0) {
                architecture = 'ia64';
            } else {
                architecture = 'x64';
            }
        } else {
            architecture = 'x86';
        }
        this.original = browser;
        this[browser] = true;
        this[engine] = true;
        this[architecture] = true;
        this.version = (!window.__BACKWARD_COMPATIBILITY_ENABLED) ? new Version(version) : version;
    };
    BrowserInfo.prototype.is = function(type) {
        return (typeof type === 'string') && (type.toLowerCase() === this.original);
    };
    PlatformInfo = function() {
        this.original = '';
        this.initialize(window.navigator.userAgent);
    };
    PlatformInfo.prototype.initialize = function(userAgent) {
        var type = '';
        var platform = '';
        var architecture = '';
        var version = '';
        var result = null;
        var mobile = /iphone|ipod|ipad|android|windows phone|silk|blackberry|symbian|mobile/;
        var pc = /windows|mac|linux/;
        var array;
        userAgent = userAgent.toLowerCase();
        result = mobile.exec(userAgent);
        if (result) {
            if (userAgent.indexOf('silk') >= 0) {
                type = 'tablet';
                platform = 'android';
            } else {
                if ((userAgent.indexOf('android') >= 0 && userAgent.indexOf('mobile') < 0) || (userAgent.indexOf('ipad') >= 0)) {
                    type = 'tablet';
                } else {
                    type = 'mobile';
                }
                platform = result[0].replace(' ', '');
            }
        } else {
            if (userAgent.indexOf('windows') >= 0) {
                type = 'pc';
                platform = 'windows';
                array = /windows nt ([\d\.]+)/.exec(userAgent);
                version = (array) ? array[1] : '';
                if (userAgent.indexOf('arm') >= 0) {
                    architecture = 'arm';
                } else if (userAgent.indexOf('win64') >= 0) {
                    if (userAgent.indexOf('ia64') >= 0) {
                        architecture = 'ia64';
                    } else {
                        architecture = 'x64';
                    }
                } else if (userAgent.indexOf('wow64') >= 0) {
                    architecture = 'x64';
                } else {
                    architecture = 'x86';
                }
            } else if (userAgent.indexOf('mac') >= 0) {
                type = 'pc';
                platform = 'mac';
                architecture = 'unknown';
            } else if (userAgent.indexOf('linux') >= 0) {
                type = 'pc';
                platform = 'linux';
                architecture = 'unknown';
            } else {
                type = 'unknown';
                platform = 'unknown';
                architecture = 'unknown';
            }
        }
        this.type = type;
        this.original = platform;
        this[type] = true;
        this[platform] = true;
        this[architecture] = true;
        this.version = new Version(version);
    };
    PlatformInfo.prototype.is = function(name) {
        if (typeof name === 'string') {
            name = name.toLowerCase();
            return ((name === this.original) || (name === this.type));
        } else {
            return false;
        }
    };
    $.browser = new BrowserInfo();
    $.platform = new PlatformInfo();
    $.depend = function() {
        var i, length, conditions, condition;
        conditions = arguments;
        for (i = 0, length = conditions.length; i < length; i++) {
            condition = conditions[i];
            if ((condition.on === true || condition.on === undefined) && typeof condition.exe === 'function') {
                return condition.exe();
            }
        }
        if (window.console && window.console.log) {
            window.console.log('Not implemented default process in "$.depend" function.');
        }
        return undefined;
    };
})(window, document, jQuery);