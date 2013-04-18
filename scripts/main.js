(function () { 
    'use strict';
	
	require.config({
		baseUrl: 'scripts',
		paths: {
			'jquery': 'libs/jquery',
			'underscore': 'libs/underscore',
			'backbone': 'libs/backbone',
			'jquery': 'libs/jquery',
			'class': 'utils/class',
			'util': 'utils/util'
		}
	});

	// 기본 라이브러리 로드
	require(['jquery', 'underscore', 'config', 'ui'], function() {
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

}());