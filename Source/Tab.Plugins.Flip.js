/*
---
script: Tabs.Plugins.Move.js
license: MIT-style license.
description: Move - swap tab horizontally or vertically.
copyright: Copyright (c) 2008 Thierry Bela
authors: [Thierry Bela]

requires: 
  tab:0.1.4: 
  - Tab
provides: [Tab.plugins.Move]
...
*/

!function (context, undefined) {

"use strict";

	function getPrefix(prop) {  
	
		//return unprefixed property if supported. prefixed properties sometimes do not work fine (MozOpacity is an empty string in FF4)
		if(prop in original.style) return prop;
	
		var upper = prop.charAt(0).toUpperCase() + prop.slice(1); 
		
		for(var i = prefixes.length; i--;) if(prefixes[i] + upper in original.style) return prefixes[i] + upper; 
				
		return prop;  
	}  
	
		//div to clone
	var original = new Element('div'),
		prefixes = ['Khtml','Moz','Webkit','O','ms'],
		transform = getPrefix('transform'),
			perspective = getPrefix('perspective'),
			transformStyle = getPrefix('transform-style'),
			backfaceVisibility = getPrefix('backface-visibility'),
			front = 'rotateX(0) rotateY(0)',
			back,
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
				
			this.tween = Object.append(this.fx, this.options.fx);
			
			if(this.options.mode == 'vertical') {
			
				front = 'rotateX(0)';
				back = 'rotateX({direction}180deg)'
			} else {
				
				front = 'rotateY(0)';
				back = 'rotateY({direction}180deg)'
			}
			
			panels.each(function (el) { this.add(el) }, this)
		},

		add: function (el) {

			if(isSupported) el.setStyles({display: 'block', position: 'static'}).
				set('tween', Object.append()).
				setStyle(backfaceVisibility, 'hidden').
				setStyles({position: 'absolute', width: el.getStyle('width'), height: el.getStyle('height')}).setStyle(transform, back.substitute({direction: ''})); 
				
			else el.style.display = 'none';
			
			return this
		},
		
		move: function (newTab, curTab) {

			if(isSupported) {
				
				if(curTab) curTab.tween(transform, back.substitute({direction: arguments[4] == -1 ? '-' : ''}));
				newTab.tween(transform, front).get('tween').chain(function () { this.fireEvent('complete') }.bind(this));
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

