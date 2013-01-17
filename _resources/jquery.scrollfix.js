/*
 * scrollfix
 * https://github.com/daffl/jquery.scrollfix
 *
 * Copyright (c) 2013 David Luecke
 * Licensed under the MIT license.
 */

(function($) {

	$.fn.scrollfix = function(options) {
		var ops = $.extend({
				elements: function() {
					return this.clone().hide();
				},
				className : 'scroll-fix',
				moveCurrent : true
			}, options),
			els = this,
			scrollFixes = ops.elements.apply(this, arguments),
			cache = [],
			updateCache = function(current) {
				els.each(function(i) {
					var el = $(this);
					if(!el.is(current)) {
						cache[i] = {
							top : el.offset().top
						}
					}
				});
			},
			loop = function(callback) {
				els.each(function(index) {
					var el = $(this);
					if(!el.is(':visible')) {
						return;
					}

					callback.call(el, index, cache[index], $(scrollFixes.get(index)));
				});
			};

		updateCache();

		this.parent().append(scrollFixes);

		$(window).on('updateScrollFix', updateCache);
		$(window).on('scroll.scrollfix', function(ev) {
			var top = $(window).scrollTop(),
				activeElement,
				moveCurrent = function() {
					var referenceHeight = activeElement.outerHeight(true),
						currentOffset = 0;

					loop(function(index, cached, scrollFix) {
						var position = this.offset().top - top,
							offset = position - referenceHeight;
						if(position > 0 && position < referenceHeight) {
							currentOffset = offset;
						}
					});

					activeElement.css('top', currentOffset < 0 ? currentOffset + 'px' : '0px');
				};

			loop(function(index, cached, scrollFix) {
				if(cached.top < top) {
					activeElement = scrollFix;
				}

				if(cached.top >= top && scrollFix.hasClass(ops.className)) {
					scrollFix.css('top', '0').removeClass(ops.className).hide();
				}
			});

			if(activeElement && !activeElement.hasClass(ops.className)) {
				scrollFixes.removeClass(ops.className).hide();
				activeElement.addClass(ops.className).show();
			}

			if(ops.moveCurrent && activeElement) {
				moveCurrent();
			}
		});
	}

}(jQuery));
