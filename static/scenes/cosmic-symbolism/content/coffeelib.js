let scroll_speed_manual_control = -1;

(function () {
  var t, e, i, n = function (t, e) {
    return function () {
      return t.apply(e, arguments)
    }
  }
    ;
  this.App = {
  }
    , this.App.url = "http://locahost:3000/appp/", this.App.description = $('meta[name="description"]').attr("content"), this.App.title = $('meta[name="title"]').attr("content"), this.App.image = $('meta[name="image"]').attr("content"), e = function (t, e) {
      var i;
      return i = t.splice(0, e), t = t.concat(i)
    }
    , this.prepareImages = function (t, i, n, s) {
      var r, o, a;
      return null == i && (i = "%s"), o = function () {
        var e, n, s;
        for (s = [], e = 0, n = t.length;
          n > e;
          e++)r = t[e], s.push(i.replace("%s", "" + r));
        return s
      }
        (), a = e(o, parseInt(n) || 0), $.imgpreloader({
          paths: a, originalOrder: !0
        }
        )
    }
    , t = function () {
      function t(t, e) {
        this.setEvents = n(this.setEvents, this), this.pause = !1, this.stage = t, this.canvasArea = $(this.stage).get(0), this.canvasContext = this.widthProgress = this.halfWidth = this.halfHeight = this.aspectWidth = this.aspectHeight = void 0, this.overallProgress = 0, this.arrowKey = {
          up: !1, down: !1
        }
          , this.platform = $.platform.type, this.fullSpeedCopy = this.fullSpeed = .012, this.currentSpeed = 0, this.increaseSpeed = 1e-4, this.imagesPerScene = 3, this.flag = !1, this.offset = 0, this.originalImages = this.images = e, this.loadedImages = [], this.touchStart = {
            x: 0, y: 0
          }
          , this.touchOffset = {
            x: 0, y: 0
          }
          , this.openPanel = !1, this.touchAction = null, this.mouseDown = null, this.window = window, this.document = document, this.progressCallback = function () {
            return !0
          }
          , this.tCreditIn = 200, this.tCreditOut = this.tCreditIn + 100, this.creditSlideEase = "easeInSine", this.toggleCreditPanel = _.throttle(this._toggleCreditPanel, 1e3, {
            trailing: !1
          }
          ), this.completeFunc = void 0, this.sharePanelDistance = 75
      }
      return t.prototype.openSharePanel = function () {
        var t;
        return $("#stage").css("left", "").animate({
          right: this.sharePanelDistance
        }
          , this.tCreditIn), t = $(".button"), t.animate({
            opacity: "0"
          }
            , this.creditSlideEase), t.delay(this.tCreditIn).fadeOut(this.tCreditIn), this.openSharePanelFlag = !0
      }
        , t.prototype.closeSharePanel = function () {
          var t, e;
          return $("#stage").animate({
            right: "0px"
          }
            , this.tCreditOut, this.creditSlideEase), t = $(".button"), t.fadeIn(this.tCreditOut), t.animate({
              opacity: "1"
            }
              , this.tCreditOut), e = function () {
                return this.openSharePanelFlag = !1
              }
            , this.openSharePanelFlag = !1, setTimeout(e, 100)
        }
        , t.prototype.openCreditPanel = function () {
          var t;
          if (this.openSharePanelFlag !== !0) return $("#stage").css("right", "").animate({
            left: this.currentSlideDistance
          }
            , this.tCreditIn), t = $(".button"), t.animate({
              opacity: "0"
            }
              , this.creditSlideEase), t.delay(this.tCreditIn).fadeOut(this.tCreditIn), this.openPanel = !0
        }
        , t.prototype.closeCreditPanel = function () {
          var t;
          return $("#stage").animate({
            left: "0px"
          }
            , this.tCreditOut, this.creditSlideEase), t = $(".button"), t.fadeIn(this.tCreditOut), t.animate({
              opacity: "1"
            }
              , this.tCreditOut), this.openPanel = !1
        }
        , t.prototype.setSwipe = function (t) {
          var e;
          return null == t && (t = this.currentSlideDistance), e = t + "px", this.openPanel && e !== $("#stage").css("left") && $("#stage").animate({
            left: e
          }
            , this.tCreditIn), $(this.document).swipe({
              swipeRight: function (t) {
                return function (e, i, n, s, r) {
                  return t.openPanel === !0 && t.closeCreditPanel(), t.openSharePanelFlag === !0 ? (setTimeout(t.closeSharePanel, 25), setTimeout(function () {
                    return t.openSharePanelFlag = !1
                  }
                    , 27)) : void 0
                }
              }
                (this), swipeLeft: function (t) {
                  return function (e, i, n, s, r) {
                    return t.openPanel === !0 ? (t.paneRecentAction = !1, t.closeCreditPanel()) : t.openSharePanel()
                  }
                }
                  (this)
            }
            )
        }
        , t.prototype.setCreditImage = function () {
          var t, e, i, n, s, r, o;
          if (e = function () {
            switch (!1) {
              case !(this.width <= 960): return "small";
              default: return "full"
            }
          }
            .call(this), s = {
              small: 250, full: 500
            }
            , i = s[e], this.currentSlideDistance = i, this.setSwipe(i), !_.isObject(this.matches)) {
            this.creditObjs = {
            }
              ;
            for (n in s) r = s[n], this.creditObjs[n] = $("#credits #" + n)
          }
          o = this.creditObjs;
          for (n in o) r = o[n], this.creditObjs[n].css({
            display: "none"
          }
          );
          return t = $("#credits #" + e), t.css({
            display: "block", opacity: "1"
          }
          ), $("#credit-text").css({
            width: "" + i + "px"
          }
          ), $(".footer").css("small" === e ? {
            "font-size": "16px"
          }
            : {
              "font-size": "25px"
            }
          )
        }
        , t.prototype.beginAnimation = function () {          
          return this.setEvents(), this.canvasContext = this.canvasArea.getContext("2d"), this.setDimensions(), prepareImages(this.images, this.template, this.offset).progress(this.progressCallback).then(function (t) {
            return function (e, i) {
              var n, s;
              return t.loadedImages = i, setInterval(function () {

                return t.motionLoop()
              }
                , 10), n = $("#loading"), s = 1e3, n.animate({
                  opacity: 0
                }
                  , {
                    duration: s, complete: function () {
                      return t.setDimensions(), n.fadeOut(1), $("#credits").css({
                        display: "block"
                      }
                      ), $(".shareable").css({
                        opacity: 1
                      }
                      ), t.setCreditImage(), t.completeFunc ? t.completeFunc.call() : void 0
                    }
                  }
                ), setInterval(function () {
                  return t.drawAnimationLoop()
                }
                  , 1e3 / 60), $(t.stage).animate({
                    opacity: 1
                  }
                    , 500)
            }
          }
            (this))
        }
        , t.prototype.setCompleteFunction = function (t) {
          return this.completeFunc = t
        }
        , t.prototype.setSpeed = function (t) {
          return this.fullSpeedCopy = t / 1e3, this.fullSpeed ? this.fullSpeed = this.fullSpeedCopy : void 0
        }
        , t.prototype.setImageSeries = function (t, e) {
          var i, n, s;
          for (null == e && (e = 1), n = [], i = s = 1;
            e > 0 ? t >= s : s >= t;
            i = s += e)n.push(i);
          return this.images = n
        }
        , t.prototype.setImageSeriesOffset = function (t) {
          return this.offset = t
        }
        , t.prototype.setImageSeriesPathTemplate = function (t) {
          return this.template = t
        }
        , t.prototype.setDimensions = function () {
          var t, e;
          return this.width = e = $(window).width(), this.height = t = $(window).height(), this.halfWidth = e / 2, this.halfHeight = t / 2, e > 1 * t ? (this.aspectWidth = e, this.aspectHeight = 1 * e) : (this.aspectWidth = 1 * t, this.aspectHeight = t), $(this.stage).attr("width", e), $(this.stage).attr("height", t), $("#credits").css("min-height", "" + t + "px"), $("#credits").css("height", "" + t + "px"), this.setCreditImage()
        }
        , t.prototype.setProgressCallback = function (t) {
          return this.progressCallback = t
        }
        , t.prototype.setImagesPerFrame = function (t) {
          return this.imagesPerScene = t
        }
        , t.prototype.setImagesPerFrameMobile = function (t) {
          return "mobile" === this.platform ? this.setImagesPerFrame(parseInt(t)) : void 0
        }
        , t.prototype.setImagesPerFrameTablet = function (t) {
          return "tablet" === this.platform ? this.setImagesPerFrame(parseInt(t)) : void 0
        }
        , t.prototype.setImagesPerFramePC = function (t) {
          return "pc" === this.platform ? this.setImagesPerFrame(parseInt(t)) : void 0
        }
        , t.prototype.drawAnimationLoop = function () {
          var t, e, i, n, s, r, o, a, h, u, c;
          for (this.canvasContext.clearRect(0, 0, this.canvasArea.width, this.canvasArea.height), n = [], e = 0;
            e < this.imagesPerScene;
          )n.push(this.loadedImages[(Math.floor(this.overallProgress) + e) % this.loadedImages.length]), e++;
          for (s = Math.pow(2, this.overallProgress % 1), e = 0, c = [], e = h = 0, u = n.length;
            u >= 0 ? u > h : h > u;
            e = u >= 0 ? ++h : --h)o = this.halfWidth - this.aspectWidth / 2 * s, a = this.halfHeight - this.aspectHeight / 2 * s, r = this.aspectWidth * s, i = this.aspectHeight * s, t = 1, e === this.imagesPerScene - 1 && (t = 10 * s * s * s), this.canvasContext.globalAlpha = t, this.canvasContext.drawImage(n[e], o, a, r, i), c.push(s *= .5);
          return c
        }
        , t.prototype.motionLoop = function () {
          var t;
          return this.currentSpeed < this.fullSpeed && this.pause === !1 && (this.currentSpeed += this.increaseSpeed), (this.arrowKey.up || this.arrowKey.down) && this.touchOffset.y && (t = this.touchOffset.y / 30, t > 12 && (t = 8)), this.arrowKey.up ? this.overallProgress += this.touchOffset.y ? t * this.fullSpeedCopy : 4 * this.fullSpeedCopy : this.arrowKey.down ? this.touchOffset.y ? this.overallProgress += t / 1.5 * this.fullSpeedCopy : this.overallProgress -= 4 * this.fullSpeedCopy : this.overallProgress = this.touchOffset.y && "move" === this.touchAction || "start" === this.touchAction ? this.overallProgress : this.overallProgress + this.currentSpeed, this.overallProgress < 0 && (this.overallProgress += this.images.length, this.images.length < this.overallProgress) ? this.overallProgress -= this.images.length : void 0
        }
        , t.prototype.allFalse = function () {
          return this.arrowKey.up = !1, this.arrowKey.down = !1
        }
        , t.prototype.touchMove = function (t, e, i) {

          return t.preventDefault(), this.touchOffset.x = this.touchStart.x - e, this.touchOffset.y = this.touchStart.y - i, this.touchOffset.y > 10 ? (this.allFalse(), this.arrowKey.up = !0) : this.touchOffset.y < -10 ? (this.allFalse(), this.arrowKey.down = !0) : this.allFalse()
        }
        , t.prototype.pauseAnimation = function () {
          return this.fullSpeed ? (this.pause = !0, this.fullSpeed = 0, this.currentSpeed = 0) : (this.pause = !1, this.fullSpeed = this.fullSpeedCopy)
        }
        , t.prototype.clearFlag = function () {
          return setTimeout(function (t) {
            return function () {
              return t.creditFlag = !1, t.paneRecentAction = !1
            }
          }
            (this), 2e3)
        }
        , t.prototype._toggleCreditPanel = function () {
          return this.openPanel ? this.closeCreditPanel() : this.openCreditPanel()
        }
        , t.prototype.setEvents = function () {
          return $(window).resize(function (t) {
            return function () {
              return t.platform = $.platform.type, t.setDimensions()
            }
          }
            (this)), $("#tshirt").on("click touchstart", function (t) {
              return function (e) {
                var i;
                return e.preventDefault(), i = $("#tshirt-link").attr("href"), window.open(i, "_blank"), $(t.document).click()
              }
            }
              (this)), this.stage = $("#stage"), $(this.stage).on("touchstart", function (t) {
                return function (e) {
                  return e.preventDefault(), t.touchAction = "start", t.touchStart.x = e.originalEvent.touches[0].pageX, t.touchStart.y = e.originalEvent.touches[0].pageY
                }
              }
                (this)), $(this.stage).on("touchmove", function (t) {
                  return function (e) {
                    var i, n;
                    return e.preventDefault(), i = e.originalEvent.touches[0].pageX, n = e.originalEvent.touches[0].pageY, t.touchMove(e, i, n)
                  }
                }
                  (this)), $(this.stage).on("touchend", function (t) {
                    return function (e) {
                      return t.allFalse(), t.touchAction = "end", t.touchStart.x = 0, t.touchStart.y = 0
                    }
                  }
                    (this)), $(this.document).on("keydown", function (t) {
                      return function (e) {
                        return t.allFalse(), t.touchAction = "end", t.touchOffset.x = 0, t.touchOffset.y = 0, 38 === e.which && (t.arrowKey.up = !0, e.preventDefault()), 40 === e.which && (t.arrowKey.down = !0, e.preventDefault()), 32 === e.which ? t.pauseAnimation() : void 0
                      }
                    }
                      (this)), $(this.document).on("keyup", function (t) {
                        return function (e) {
                          return 38 === e.which && (t.arrowKey.up = !1, e.preventDefault()), 40 === e.which ? (t.arrowKey.down = !1, e.preventDefault()) : void 0
                        }
                      }
                        (this)), $(this.stage).on("mousedown", function (t) {
                          console.log("mousedown!")
                          return function (e) {
                            return $(t).data("p0", {
                              x: e.pageX, y: e.pageY
                            }
                            ), t.mouseDown = !0, t.touchAction = "start", t.touchStart.x = e.pageX, t.touchStart.y = e.pageY
                          }
                        }
                          (this)), $(this.stage).on("mousemove", function (t) {
                            console.log("mousemove!")
                            return function (e) {
                              var i, n, s, r;
                              return t.mouseDown ? (i = $(t).data("p0"), n = {
                                x: e.pageX, y: e.pageY
                              }
                                , s = e.pageX, r = e.pageY, t.touchMove(e, s, r)) : void 0
                            }
                          }
                            (this)), $(this.document).on("tap press click", function (t) {
                              return function (e) {
                                var i;
                                if (!("click" === e.type && e.bubbles === !1 && "pc" === t.platform || "click" === e.type && e.isTrigger === !0 && "pc" === t.platform || ("tap" === (i = e.type) || "press" === i) && "pc" === t.platform)) return t.creditFlag === !0 && t.toggleCreditPanel(), t.clearFlag(), t.creditFlag = !0
                              }
                            }
                              (this)), $(this.document).on("dblclick doubletap", function (t) {
                                // return function(e){
                                // return"doubletap"!==e.type||"pc"!==t.platform?t.toggleCreditPanel():void 0}
                              }
                                (this)), $(this.stage).on("dblclick doubletap", function (t) {
                                  console.log("dblclick!")
                                  return function (e) {
                                    return ("doubletap" !== e.type || "pc" !== t.platform) && t.openSharePanelFlag === !0 ? t.closeSharePanel() : void 0
                                  }
                                }
                                  (this)), $(this.document).on("mouseup", function (t) {
                                    return function (e) {
                                      return t.allFalse(), t.touchAction = "end", t.mouseDown = !1, t.touchStart.x = 0, t.touchStart.y = 0
                                    }
                                  }
                                    (this)), $("#share").on("touchstart touchend click", function (t) {
                                      return function (e) {
                                        return e.preventDefault(), t.openSharePanel()
                                      }
                                    }
                                      (this)), $("#email").on("touchstart touchend click", function (t) {
                                        return function (t) {
                                          var e, i, n, s;
                                          return t.preventDefault(), s = window.location.href, n = encodeURIComponent(App.title), e = "Check it out: " + App.title + " " + s + " " + App.description, i = encodeURIComponent(e), window.location = "mailto:%20?subject=" + n + "&body=" + i
                                        }
                                      }
                                        (this)), $(this.stage).on("mousewheel", function (t) {
                                          var event = null
                                          return function (e) {
                                            
                                            //t.touchAction = "start"
                                            // SEARCH HERE!!!!!!!!!!!
                                            // console.log("mousewheel!", e.deltaX, e.deltaY, scroll_speed_manual_control)
                                            
                                            let deltaYAdjust = scroll_speed_manual_control !== -1 ? scroll_speed_manual_control : e.deltaY
                                            var i, n;
                                            //return i = e.deltaX, n = e.deltaY, t.touchAction = "start", t.touchMove(e, i, 4 * n), n > -2 && 2 > n ? setTimeout(function () {
                                            return i = e.deltaX, n = deltaYAdjust, t.touchAction = "start", t.touchMove(e, i, 4 * n), n > -2 && 2 > n ? setTimeout(function () {
                                              return t.allFalse(), t.touchAction = "end", t.touchStart.x = 0, t.touchStart.y = 0
                                            }
                                              , 200) : void 0
                                          }
                                        }
                                          (this))
        }
        , t
    }
      (), i = function () {
        var t, e, i, n, s;
        return s = {
          tumblr: function (t, e, i, n) {
            return t = encodeURIComponent("" + t + "?t"), e = encodeURIComponent(e), i = encodeURIComponent(i), n = encodeURIComponent(n), "https://www.tumblr.com/share/link?url=" + t + "&name=" + e + "&description=" + i + "&img=" + n
          }
          , pinterest: function (t, e, i, n) {
            return t = encodeURIComponent("" + t + "?p"), e = encodeURIComponent(e), i = encodeURIComponent(i), n = encodeURIComponent(n), "https://www.pinterest.com/pin/create/button/?url=" + t + "&media=" + n + "&description=" + i
          }
          , email: function (t, e, i) {
            return t = encodeURIComponent("" + t + "?e"), e = encodeURIComponent(e), i = encodeURIComponent(i), "mailto:%20?subject=" + e + "&body=" + i
          }
        }
          , t = {
            url: App.url, title: App.title, summary: App.description, image: App.image, via: "ImaginaryFndn"
          }
          , i = {
          }
          , i.facebook = {
          }
          , i.twitter = {
          }
          , i.tumblr = {
            image: "" + App.url + "images/social-tumblr.jpg"
          }
          , i.pinterest = {
            image: "" + App.url + "images/social-pinterest.jpg"
          }
          , n = ["facebook", "twitter"], function () {
            var e, s, r, o, a, h, u, c, l;
            c = _.pick(i, n), l = [];
            for (o in c) u = c[o], r = _.extend(t, u), r.id || (r.id = o), e = "#" + r.id, delete r.id, l.push(function () {
              var t;
              t = [];
              for (s in r) h = r[s], a = "st_" + s, t.push($(e).attr(a, h));
              return t
            }
              ());
            return l
          }
            (), e = ["tumblr", "pinterest", "email"], function () {
              var n, r, o, a, h, u, c, l, p;
              l = _.pick(s, e), p = [];
              for (c in l) a = l[c], h = _.extend(t, i[c]), u = function () {
                var t, e, i, s;
                for (i = ["url", "title", "summary", "image"], s = [], t = 0, e = i.length;
                  e > t;
                  t++)n = i[t], h[n] && s.push(h[n]);
                return s
              }
                (), o = a.apply(this, u), r = "#" + c, p.push(function (t, e) {
                  return $(t).click(function () {
                    return window.open(e, "_blank")
                  }
                  )
                }
                  (r, o));
              return p
            }
            (), setTimeout(function () {
              return stLight.options({
                publisher: "7a0f7600-a637-4376-a78e-9f5613b50795", popup: !0, shorten: !1, doNotHash: !1, doNotCopy: !1, hashAddressBar: !1, onhover: !1, onclick: !1
              }
              )
            }
              , 25)
      }
    , setTimeout(function () {
      return $("#loading").css({
        opacity: "0.4"
      }
      )
    }
      , 1e3), $(function () {
        var e, n;
        return e = -1 !== window.navigator.userAgent.toLowerCase().indexOf("firefox"), n = new t("#stage"), n.setImageSeries(38, 1), n.setImageSeriesOffset(0), n.setImageSeriesPathTemplate("images/%s.jpg"), n.setProgressCallback(function (t) {
          return function (t, e, i, n, s, r) {
            return $("#loadbar").css("width", Math.floor(r) + "%")
          }
        }
          (this)), n.setSpeed(16), n.setImagesPerFrameMobile(2), n.setImagesPerFrameTablet(4), n.setImagesPerFramePC(4), n.setCompleteFunction(i), e && (n.setSpeed(20), n.fullSpeedCopy = n.fullSpeed = .04, n.increaseSpeed = .002), n.beginAnimation()
      }
      )
}
).call(this);
