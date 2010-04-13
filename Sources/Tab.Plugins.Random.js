
/*
Script: Tabs.Plugins.Random.js
	Apply various effects to tab swapping
	
	License: MIT-style license.
	Copyright: Copyright (c) 2009 Thierry Bela
	License:
		MIT-style license.

	Authors:
		Thierry Bela

*/

	Tab.prototype.plugins.Random = new Class({
		options: {
			/*
				useOpacity: false,
				opacity: .7,
			*/
			
				transitions: ['fade', 'move', 'slideIn', 'slideOut']
			},
		fx: {
		
			link: 'chain',
			duration: 1000
		},
		initialize: function(panels, options, fx) {
		
			fx = $merge(this.fx, fx);
					
			options = this.options = $merge(this.options, options);
			options.transitions = $splat(this.options.transitions);
			
			['move', 'slideIn', 'slideOut'].each(function (v) {
			
				if(options.transitions.indexOf(v) != -1) {
					options.transitions.erase(v);
					
					if(v == 'move') v = '_move';
					['left', 'right', 'top', 'bottom'].each(function (d) {
					
						options.transitions.push(v + '-' + d)
					})
				}
			});
			
			this.panels = panels;
			
			panels.each(function (el) {
			
				el.set({
						styles: {
						
							position: 'absolute',
							zIndex: 0,
							display: 'none'
						},
						morph: fx
					})
			});
			
			var panel = panels[0];
			
			this.container = panel.setStyle('display', 'block').getParent().setStyles({position: 'relative', overflow: 'hidden', height: panel.offsetHeight, width: panel.offsetWidth});
			
			this.current = 0
		},
		move: function (newTab, curTab) {
			
			var transition = this.options.transitions[this.current];
			this.ct = curTab;
			this.nt = newTab;
			
			//reset first!
			if(curTab) curTab.setStyles({left: 0, top: 0});

			var parts = transition.split('-');

			this[parts[0]](curTab, newTab, parts[1]);
                        
			this.current = (this.current + 1) % this.options.transitions.length
		},
		
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
			
			newTab.morph(morph).get('morph').chain(function () { curTab.setStyle('display', 'none'); newTab.setStyle('z-index', 0) });
			this.container.morph({height: newTab.offsetHeight, width: newTab.offsetWidth})
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
			
			curTab.morph(morph).get('morph');
			this.container.morph({height: newTab.offsetHeight, width: newTab.offsetWidth})
		},
		fade: function (curTab, newTab) {
			
			if (curTab) {
				
				curTab.setStyles({zIndex: 0, left: 0, top: 0});
							
				newTab.setStyles({display: 'block', opacity: 0, zIndex:1, left: 0, top: 0}).
										morph({opacity: 1}).get('morph').chain(function () {
						
								curTab.setStyles({opacity: 0, display: 'none'});
								newTab.setStyle('z-index', 0)
							})
			}
								
			else newTab.set({styles:{display: 'block'}}).morph({opacity: [.5, 1]})
			
			var morph = {height: newTab.offsetHeight, width: newTab.offsetWidth}
			this.container.morph(morph)
		},
		_move: function (curTab, newTab, f) {
			
			if(curTab) {
			
				var obj = [],
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
					
						obj[index] = {opacity: [.7, 1], top: [p.offsetTop, p.offsetTop - offset]}
					});
					
				else l.each(function (p, index) {
					
						obj[index] = {opacity: [.7, 1], left: [p.offsetLeft, p.offsetLeft - offset]}
					});
				
				if(!options.useOpacity) $each(obj, function (k) { delete k.opacity });
			
				l.each(function (p, index) {
				
					p.morph(obj[index]);
					
					if(index == 1) p.get('morph').chain(function () {
					
						l[0].setStyles({display: 'none', left: 0, top: 0})
					})
				})
				
			} else 	newTab.setStyles({opacity: 1, display: 'block'});
			
			morph = {height: newTab.offsetHeight, width: newTab.offsetWidth}
			this.container.morph(morph)
		}
	});

