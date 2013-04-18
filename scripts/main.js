(function () { 
    'use strict';

    // 기본 라이브러리 로드
    require(['jquery', 'underscore', 'backbone'], function() {
        if (typeof console === 'undefined') { this.console = { log: function() {} }; }

    });
    	
	window.requestAnimFrame = function () {
		return window.requestAnimationFrame || 
			window.webkitRequestAnimationFrame || 
			window.mozRequestAnimationFrame || 
			window.oRequestAnimationFrame || 
			window.msRequestAnimationFrame || 
			function (a, b) {
				window.setTimeout(a, 1e3 / 60);
			};
	}();

	/*
	 * Sets up jquery
	 */
	define('transformSupport',[
		'jquery'
	], function($) {
		$.support.css = $.support.css || {};
		if (Modernizr.csstransitions){
			$.support.css.transition = {
				cssName: Modernizr.prefixed('transition'),
				endEventNames: {
					'WebkitTransition' : 'webkitTransitionEnd',
					'MozTransition'    : 'transitionend',
					'OTransition'      : 'oTransitionEnd',
					'msTransition'     : 'MSTransitionEnd',
					'transition'       : 'transitionend'
				}
			};
			$.support.css.transition.endName = $.support.css.transition.endEventNames[$.support.css.transition.cssName];
			$.support.css.transition.registerTransitionEndListener = function(el, deferred){
				if (!deferred){
					deferred = $.Deferred();
				}
				var transitionEndName = $.support.css.transition.endName;
				var transitionEndFunc = function transitionEnd(){
					this.removeEventListener(transitionEndName, transitionEndFunc);
					deferred.resolve();
					transitionEndFunc = null;
				};
				el.addEventListener($.support.css.transition.endName, transitionEndFunc);
				return deferred.promise();
			};
		}
		if (Modernizr.csstransforms3d &&
			// and not safari 5
			!(navigator.userAgent.indexOf('Safari') > -1 && navigator.userAgent.indexOf('Chrome') === -1 &&
			navigator.userAgent.indexOf('Version/5') !== -1)){

			$.support.css.transform = {
				cssName: Modernizr.prefixed('transform'),
				originCssName: Modernizr.prefixed('transformOrigin'),
				styleCssName: Modernizr.prefixed('transformStyle'),
				backfaceVisibilityCssName: Modernizr.prefixed('backfaceVisibility'),
				perspectiveCssName: Modernizr.prefixed('perspective'),
				perspectiveOriginCssName: Modernizr.prefixed('perspectiveOrigin')
			};
			$.support.css.transform.cssHyphenName = $.support.css.transform.cssName.replace(/([A-Z])/g,
				function(str,m1){
					return '-' + m1.toLowerCase();
				}).replace(/^ms-/,'-ms-');
		}
	});

	/*!
	 * jQuery Cookie Plugin
	 * https://github.com/carhartl/jquery-cookie
	 *
	 * Copyright 2011, Klaus Hartl
	 * Dual licensed under the MIT or GPL Version 2 licenses.
	 * http://www.opensource.org/licenses/mit-license.php
	 * http://www.opensource.org/licenses/GPL-2.0
	 */
	define('cookie',[
		'jquery'
	], function($) {
		$.cookie = function(key, value, options) {

			// key and at least value given, set cookie...
			if (arguments.length > 1 && (!/Object/.test(Object.prototype.toString.call(value)) || value === null || value === undefined)) {
				options = $.extend({}, options);

				if (value === null || value === undefined) {
					options.expires = -1;
				}

				if (typeof options.expires === 'number') {
					var days = options.expires, t = options.expires = new Date();
					t.setDate(t.getDate() + days);
				}

				value = String(value);

				return (document.cookie = [
					encodeURIComponent(key), '=', options.raw ? value : encodeURIComponent(value),
					options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
					options.path    ? '; path=' + options.path : '',
					options.domain  ? '; domain=' + options.domain : '',
					options.secure  ? '; secure' : ''
				].join(''));
			}

			// key and possibly options given, get cookie...
			options = value || {};
			var decode = options.raw ? function(s) { return s; } : decodeURIComponent;

			var pairs = document.cookie.split('; ');
			for (var i = 0, pair; pair = pairs[i] && pairs[i].split('='); i++) {
				if (decode(pair[0]) === key) return decode(pair[1] || ''); // IE saves cookies with empty string as "c; ", e.g. without "=" as opposed to EOMB, thus pair[1] may be undefined
			}
			return null;
		};
	});
	
	define('managers/routemanager', ['jquery', 'underscore', 'backbone'], function($, _, Backbone) {
	    var RouteManager = Backbone.Router.extend({
	        initialize: function(options) {
	            this.options = $.extend(true, {
	                siteConfig: {},
	                onRouteChange: function(app, route, path){}
	            }, options);
	            this.urls = [];
	            this.parseSiteConfig(this.options.siteConfig);
	        },
	        destroy: function() {
	            Backbone.history.stop();
	        },
	        getRouteInfoForPath: function(path) {
	            return _.find(this.urls, function(url) {
	                return url.url.test(path);
	            });
	        },
	        parseSiteConfig: function(siteConfig) {
	            var numAppsLoaded = 0,
	               _this = this;
	               
	              _.each(siteConfig.apps, function(app) {
	                  require([app.appClass], function(AppClass) {
	                      app.appClass = AppClass;
	                      numAppsLoaded++;
	                      if (numAppsLoaded === siteConfig.apps.length) {
	                          _.each(siteConfig.apps, function(app) {
	                              _.each(app.routes, function(route) {
	                                  _.each(route.urls, function(url) {
	                                      var regEx = new RegExp(url);
	                                      _this.urls.unshift({url: regEx, appClass: app.appClass, app: app, route: route});
	                                      _this.route(regEx, app.name, function(path) {
	                                          _this.options.onRouteChange(app, route, path);
	                                      });
	                                  });
	                              });
	                          });
	                          
	                          Backbone.history.start({pushState: true, hashChange: false});
	                      }
	                  });
	              });
	        }
	    });
	    
	    return RouteManager;
	});


    define('app', ['jquery', 'underscore', 'backbone'], function($, _, Backbone) {
        var AppModel = Backbone.Model.extend({
            initialize: function() {
                this.set('doc', $(document));
                this.set('win', $(window));
                this.set('body', $('body'));
                
                this.set('baseUrl', window.location.protocol + '//' + window.location.host + '/');
            },
            
            getPageUrl: function() {
                var loc = document.location;
                return loc.protocol + '//' + loc.host + loc.pathname; 
            },
            
            getScrollPosition: function() {
                return window.pageYOffset || document.body.scrollTop;
            },
            
            loadScript: function(url, symbol, callback) {
                if (window[symbol]) { callback() }
                else {
                    require([url], function(s){ 
                        callback(s);    
                    });
                }
            },
            
            openPopup: function(url, width, height) {
                width = width || 600;
                height = height || 400;
                
                var winCoords = this.popupCoords(width, height);
                window.open(
                    url,
                    '',
                    '
                    'menubar=no, toolbar=no, resizable=yes, scrollbars=yes, ' +
                    'height=' + height + ', width=' + width + ', top=' + winCoords.top + ', left=' + winCoords.left
                );
            },
            
            popupCoords: function(w, h) {
                var wLeft = window.screenLeft ? window.screenLeft : window.screenX;
                var wTop = window.screenTop ? window.screenTop : window.screenY;
                var wWidth = window.outerWidth ? window.outerWidth : document.documentElement.clientWidth;
                var wHeight = window.outerHeight ? window.outerHeight : document.documentElement.clientHeight;
    
                return {
                    left: wLeft + (wWidth / 2) - (w / 2),
                    top: wTop + (wHeight / 2) - (h / 2) - 25
                };
            },
            
                
            addCommas: function(nStr) {
                nStr += '';
                var x = nStr.split('.');
                var x1 = x[0];
                var x2 = x.length > 1 ? '.' + x[1] : '';
                var rgx = /(\d+)(\d{3})/;
                while (rgx.test(x1)) {
                    x1 = x1.replace(rgx, '$1' + ',' + '$2');
                }
                return x1 + x2;
            },
            
            lazyLoadImage: function(attrs) {
                var hasLazyImage = false;
                attrs || (attrs = {});
                
                var dataSrcAttr = attrs.dataSrcAttr || 'data-src',
                    img = attrs.img,
                    onError = attrs.onError || function(){};
                    
                $(img).each(function(index, el){
                    var $el = $(el), dataSrc = $el.attr(dataSrcAttr), src = $el.attr('src');
                    if (dataSrc && src !== dataSrc) {
                        $el.removeAttr(dataSrcAttr).on('error', onError).attr('src', dataSrc);
                        hasLazyImage = true;
                    }
                });
                return hasLazyImage;
            }
            
            requireSingleUseScript: function(script) {
                return $.Deferred(function(defer) {
                    require([script], function(view) {
                        defer.resolveWith(this, [view]);
                    }, function (err) {
                        console.error('failed loading scripts', err);
                        defer.rejectWith(this, err);
                    });
                }).always(_.bind(function() {
                    // cleanup
                    this.removeRequireModule(script);
                }, this)).promise();
            },
            
            getUrlParam : function(key) {
                var s = decodeURI((new RegExp(key + '=' + '(.+?)(&|$)').exec(window.location.search)||[0,false])[1]);
                if (s === 'false') {
                    return false;
                } else if (s === 'true') {
                    return true;
                }
                return s;
            }
            
        });
        
        return new AppModel();
    });

    define('appview', ['jquery', 'backbone', 'underscore'], function($, _, Backbone) {
        var AppView = Backbone.View.extend({
            el: 'body',
            events: {},
            initialize: function(options) {
                
            }
        })
    });

}());