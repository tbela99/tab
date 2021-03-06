/*
---
script: Tabs.Plugins.Flip.js
license: MIT-style license.
description: Flip - swap tab horizontally or vertically in 3D space.
copyright: Copyright (c) 2008 Thierry Bela
authors: [Thierry Bela]

requires: 
tab: 
- Tab
- Fx.CSS
provides: [Tab.plugins.Flip]
...
*/

!function (context) {

"use strict";

		//div to clone
	var original = new Element('div'),
		transform = original.getPrefixed('transform'),
			perspective = original.getPrefixed('perspective'),
			transformStyle = original.getPrefixed('transform-style'),
			backfaceVisibility = original.getPrefixed('backface-visibility'),
			isSupported = perspective in original.style;
	
	context.Tab.prototype.plugins.Flip = new Class({
	
		options: {
		
			perspective: 1200
		},
		fx: {

			link: 'cancel',
			duration: 800
		},
		Implements: [Options, Events],
		initialize: function(panels, options, fx) {

			options = this.setOptions(options);
			
			this.container = this.options.container.setStyles({display: 'block', position: 'relative'}).
				setStyle(transformStyle, 'preserve-3d').
				setStyle(perspective, this.options.perspective);
				
			if(this.options.mode == 'vertical') {
			
				this.front = 'rotateX(0)';
				this.back = 'rotateX({direction}180deg)'
			} else {
				
				this.front = 'rotateY(0)';
				this.back = 'rotateY({direction}180deg)'
			}
			
			panels.each(function (el) { this.add(el) }, this)
		},

		add: function (el) {

			if(isSupported) el.setStyles({display: 'block', position: 'static'}).
				set('tween', Object.append({}, this.fx, this.options.fx)).
				//setStyle(backfaceVisibility, 'hidden').
				setStyles({position: 'absolute', width: el.getStyle('width'), height: el.getStyle('height')}).setStyle(transform, this.back.substitute({direction: ''})).style[backfaceVisibility] = 'hidden'; 
				
			else el.style.display = 'none';
						
			return this
		},
		
		move: function (newTab, curTab) {

			if(isSupported) {
				
				if(curTab) curTab.tween(transform, this.back.substitute({direction: arguments[4] == -1 ? '-' : ''}));
				newTab.tween(transform, this.front).get('tween').chain(function () { this.fireEvent('complete') }.bind(this));
				this.fireEvent('change', Array.slice(arguments)).fireEvent('resize', newTab)
			}
			
			else {
			
				newTab.style.display = 'block';
				if(curTab) curTab.style.display = 'none';
				
				this.fireEvent('change', Array.slice(arguments)).fireEvent('resize', newTab).fireEvent('complete')
			}				
		},
		isSupported: function () {
		
			return isSupported
		}
	})
	
}(this);

