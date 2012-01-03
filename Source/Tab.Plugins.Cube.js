
/*
---
script: Tabs.Plugins.Cube.js
license: MIT-style license.
description: Cube - swap tab in 3D space.
copyright: Copyright (c) 2008 Thierry Bela
authors: [Thierry Bela]

requires: 
  tab:0.1.4: 
  - Tab
provides: [Tab.plugins.Cube]
...
*/

!function (context, undefined) {

"use strict";

	function getPrefix(prop) {  
	
		prop = prop.camelCase();
	
		//return unprefixed property if supported. prefixed properties sometimes do not work fine (MozOpacity is an empty string in FF4)
		if(prop in original.style) return prop;
	
		var upper = prop.charAt(0).toUpperCase() + prop.slice(1); 
		
		for(var i = prefixes.length; i--;) if(prefixes[i] + upper in original.style) return prefixes[i] + upper; 
				
		return prop;  
	}  
	
		//div to clone
	var original = new Element('div'),
		prefixes = ['Khtml','Moz','Webkit','O','Ms'],
		transform = getPrefix('transform'),
		perspective = getPrefix('perspective'),
		transformStyle = getPrefix('transform-style'),
		backfaceVisibility = getPrefix('backface-visibility'),
		isSupported = perspective in original.style;


	context.Tab.prototype.plugins.Cube = new Class({
	
		width: 0,
		current: -1,
		panels: [],
		options: {
		
			//wrapper: 'div',
			perspective: 1200
		},
		Implements: [Options, Events],
		initialize: function(panels, options, fx) {

			options = this.setOptions(options).options;
			
			//new Element(options.wrapper).wraps(options.container).style[perspective] = options.perspective + 'px';
			
			this.container = options.container.setStyles({display: 'block', position: 'relative'}).
				setStyle(transformStyle, 'preserve-3d').
				setStyle(backfaceVisibility, 'hidden').
				set('tween', fx);
				
			//this.fx = Object.append(this.fx, fx);
			
			this.setMode(options.mode);
			this.panels = panels;
			panels.each(this.add, this)
		},
		
		setMode: function (mode) {
		
			switch(mode) {
			
				case 'vertical':
				
						this.direction = ['front', 'top', 'back', 'bottom'];
						this.style = 'rotateX({theta}deg) rotateY(0) translateZ({width}px)';
						this.rotate = {

								front: 'translateZ(-{width}px) rotateX({theta}deg) rotateY(0)',
								back: 'translateZ(-{width}px) rotateX({theta}deg) rotateY(0)',
								top: 'translateZ(0) rotateX({theta}deg) rotateY(0)',
								bottom: 'translateZ(0) rotateX({theta}deg) rotateY(0)'
							};
						break;
						
				default:
						
						this.direction = ['front', 'right', 'back', 'left'];
						this.style = 'rotateX(0) rotateY({theta}deg) translateZ({width}px)';
						this.rotate = {

								front: 'translateZ(-{width}px) rotateX(0) rotateY({theta}deg)',
								back: 'translateZ(-{width}px) rotateX(0) rotateY({theta}deg)',
								right:  'translateZ(0) rotateX(0) rotateY({theta}deg)',
								left:  'translateZ(0) rotateX(0) rotateY({theta}deg)'
							};
						break;
			}
			
			return this
		},

		add: function (el, index) {

			if(isSupported) {
				
				el.setStyles({display: 'block', position: 'static'});
				
				if(this.width == 0) {
				
					this.width = this.container.getStyle(this.options.mode == 'vertical' ? 'height' : 'width').toInt() / 2;
					this.container.style[transform] = this.style.substitute({width: 0, theta: 0});
					//this.container.parentNode.setStyles({width: el.getStyle('width'), height: el.getStyle('height')})
				} 
				
				el.setStyles({position: 'absolute', width: el.getStyle('width'), height: el.getStyle('height')/* , left: 0, top: 0 */})
			} 
				
			el.style.display = 'none';
				
			return this
		},
		
		move: function (newTab, curTab) {

			if(isSupported) {
				
				newTab.style.display = 'block';
						
				this.current = this.current + (arguments[4]  || 1);
				
				var face = this.direction[(this.current % 4 + 4) % 4],
					obj = {theta: this.current * 90, width: this.width};
					
				newTab.style[transform] = this.style.substitute(obj);
				
				obj.theta *= -1;
				
				this.container.tween(transform, this.rotate[face].substitute(obj)).get('tween').chain(function () { 
				
					if(curTab) curTab.style.display = 'none' 
					
					if(this.current % 4 == 0) {
					
						this.current = 0;
						obj.theta = 0;
						this.container.style[transform] = this.rotate[face].substitute(obj)
					}
					
				}.bind(this))
			}
			
			else {
			
				newTab.style.display = 'block';
				if(curTab) curTab.style.display = 'none';
				
			}				
				
			this.fireEvent('change', Array.slice(arguments)).fireEvent('resize', newTab).fireEvent('complete')
		},
		
		isSupported: function () {
		
			return isSupported
		}
	})
	
}(this);


