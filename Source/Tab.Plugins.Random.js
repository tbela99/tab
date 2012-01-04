/*
---
script: Tabs.Plugins.Random.js
license: MIT-style license.
description: Random - Provide random multiple effetcs like the barack slideshow.
copyright: Copyright (c) 2008 Thierry Bela
authors: [Thierry Bela]

requires: 
tab: 
- Tab
provides: [Tab.plugins.Random]
...
*/

!function (context) {

"use strict";

	var transitions = {
	
		slideIn: function (curTab, newTab, f) {
		
			//curTab.setStyle('z-index', 0);
			newTab.setStyles({zIndex: 1, display: 'block', opacity: 0});
			
			var morph = {opacity: 1}, 
				l = 'offsetWidth', 
				t = 'offsetHeight';
			
			switch(f) {
			
				case 'left' :
						morph.left = [-newTab[l], 0];
						morph.top = 0;
						break;
				case 'top' :
						morph.left = 0
						morph.top = [-newTab[t], 0]
						break;
				case 'right' :
						morph.left = [newTab[l], 0]
						morph.top = 0
						break;
				default :
						morph.left = 0
						morph.top = [newTab[t], 0]
						break;
			}
			
			newTab.morph(morph).get('morph').chain(function () { if(curTab) curTab.style.display = 'none'; newTab.setStyle('z-index', 0); this.fireEvent('complete') }.bind(this))
		},
		slideOut: function (curTab, newTab, f) {
		
			curTab.setStyle('z-index', 1);
			newTab.setStyles({zIndex: 0, display: 'block', opacity: 1, left: 0, top: 0});
			
			var morph = {opacity: 0}, 
				l = 'offsetWidth', 
				t = 'offsetHeight';
			
			switch(f) {
			
				case 'left' :
						morph.left = [0, -curTab[l]];
						morph.top = 0;
						break;
				case 'top' :
						morph.left = 0
						morph.top = [0, -curTab[t]]
						break;
				case 'right' :
						morph.left = [0, curTab[l]]
						morph.top = 0
						break;
				default :
						morph.left = 0
						morph.top = [0, curTab[t]]
						break;
			}
			
			curTab.morph(morph);
			this.fireEvent('complete')
		},
		fade: function (curTab, newTab) {
			
			if (curTab) {
				
				curTab.setStyles({zIndex: 0, left: 0, top: 0});
							
				newTab.setStyles({display: 'block', opacity: 0, zIndex:1, left: 0, top: 0}).
										morph({opacity: 1}).get('morph').chain(function () {
						
								curTab.setStyles({opacity: 0, display: 'none'});
								newTab.setStyle('z-index', 0);
								this.fireEvent('complete')
							}.bind(this))
			}
								
			else {
			
				newTab.set({styles:{display: 'block'}}).morph({opacity: [.5, 1]});
				this.fireEvent('complete')
			}
		},
		move: function (curTab, newTab, f) {
			
			if(curTab) {
			
				var obj = [],
					options = this.options,
					opacity = options.opacity || .7,
					property = ['top', 'bottom'].indexOf(f) != -1 ? 'offsetHeight' : 'offsetWidth',
					offset = curTab[property],
					l = [curTab, newTab],
					props,
					morph;
				
				if(['left', 'top'].indexOf(f) != -1) offset = -offset;
				
				newTab.setStyles({display: 'block', opacity: 1});
				
				switch(f) {
				
					//right to left
					case 'left':
									props = {left:curTab.offsetLeft - newTab.offsetWidth , top: curTab.offsetTop};
									break;
					//top to bottom
					case 'top':
									props = {top: curTab.offsetTop - curTab.offsetHeight, left: curTab.offsetLeft};
									break
					//right to left
					case 'right':
									props = {left: curTab.offsetLeft + newTab.offsetWidth, top: curTab.offsetTop};
									break
					//bottom to top
					case 'bottom':
									props = {top: curTab.offsetTop + curTab.offsetHeight, left: curTab.offsetLeft};
									break
				}
				
				newTab.setStyles(props);
				
				if(property == 'offsetHeight') l.each(function (p, index) {
					
						obj[index] = {opacity: [opacity, 1], top: [p.offsetTop, p.offsetTop - offset]}
					});
					
				else l.each(function (p, index) {
					
						obj[index] = {opacity: [opacity, 1], left: [p.offsetLeft, p.offsetLeft - offset]}
					});
				
				if(!options.useOpacity) Object.each(obj, function (k) { delete k.opacity });
			
				l.each(function (p, index) {
				
					p.morph(obj[index]);
					
					if(index == 1) p.get('morph').chain(function () {
					
						l[0].setStyles({display: 'none', left: 0, top: 0});
						this.fireEvent('complete')
					}.bind(this))
				}, this)
				
			} else 	{
			
				newTab.setStyles({opacity: 1, display: 'block'});
				this.fireEvent('complete')
			}
		}
	};
	
	context.Tab.prototype.plugins.Random = new Class({
		options: {
			/*
				useOpacity: false,
				opacity: .7,
				random: false,
				transitions: ['fade', 'move', 'slideIn', 'slideOut'],
			*/
				directions: ['left', 'right', 'top', 'bottom']
			},
		fx: {
		
			link: 'chain',
			duration: 1000
		},
		transitions: {},
		Implements: [Options, Events],
		initialize: function(panels, options, fx) {
		
			fx = Object.merge(this.fx, fx);
					
			options = this.setOptions(options).addTransition(transitions).options;
			options.directions = Array.from(this.options.directions);
			
			var tr = Array.from(this.options.transitions || Object.keys(this.transitions)), panel = panels[0];
			
			this.options.transitions = [];
			
			tr.each(function (v) { 
				if(v != 'fade') this.options.directions.each(function (d) { options.transitions.push(v + '-' + d) });
				else options.transitions.push(v)
			}, this);
			
			this.panels = panels;
			
			panels.each(function (el) {
			
				el.setStyle('display', 'block').set({
						styles: {
						
							width: el.getStyle('width'),
							position: 'absolute',
							zIndex: 0,
							display: 'none'
						},
						morph: fx
					})
			});
			
			this.container = options.container.setStyles({position: 'relative', overflow: 'hidden'});
			
			if(panel) {
				
				panel.setStyle('display', 'block');
				this.container.setStyles({height: panel.offsetHeight, width: panel.offsetWidth});
			}
			
			this.current = 0
		},
		add: function (el) {
					
			el.setStyle('display', 'block').set({
					styles: {
					
						width: el.getStyle('width'),
						position: 'absolute',
						zIndex: 0,
						display: 'none'
					},
					morph: this.fx
				});
				
			return this
		},
		move: function (newTab, curTab) {
			
			var options = this.options,
				transition = options.transitions[this.current];
			this.ct = curTab;
			this.nt = newTab;
			
			//reset first!
			if(curTab) curTab.setStyles({left: 0, top: 0});

			var parts = transition.split('-');

			this.transitions[parts[0]](curTab, newTab, parts[1]);
                        
			this.current = options.random ? Number.random(0, options.transitions.length - 1) : (this.current + 1) % options.transitions.length;
			
			this.fireEvent('change', Array.slice(arguments)).fireEvent('resize', newTab);
		},
		
		addTransition: function (tr, fn) {
		
			if(typeof tr == 'object') Object.each(tr, function (fn, key) { this.transitions[key] = fn.bind(this) }, this);
			else this.transitions[tr] = fn.bind(this);
			
			return this
		}
	})
}(this);
