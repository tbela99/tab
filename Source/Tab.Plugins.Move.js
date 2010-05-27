/*
---
script: Tabs.Plugins.Move.js
license: MIT-style license.
description: Move - swap tab horizontally or vertically.
copyright: Copyright (c) 2008 Thierry Bela
authors: [Thierry Bela]

requires: 
  tab:0.1.3.4: 
  - Tab
provides: [Tab.plugins.Move]
...
*/

	Tab.prototype.plugins.Move = new Class({
		options: {
			/*
				circular: false,
				useOpacity: false,
				opacity: .7,
			*/
			
				mode: 'horizontal'
			},
		fx: {
		
			link: 'chain',
			duration: 1000
		},
		initialize: function(panels, options, fx) {
		
			this.options = $merge(this.options, options);
			
			this.panels = panels.map(function (el) { return el.setStyles({position: 'absolute', display: 'block'}) });
			
			this.fx = new Fx.Elements(panels, $merge(this.fx, fx));
			
			this.reorder(0, 1).container = panels[0].getParent().setStyles({overflow: 'hidden', position: 'relative', width: panels[0].offsetWidth, height: panels[0].offsetHeight})
		},
		
		reorder: function (offset, direction) {
		
			var pos = 0,
				i,
				options = this.options,
				panels = this.panels,
				length = panels.length,
				horizontal = options.mode == 'horizontal',
				side = horizontal ? 'offsetWidth' : 'offsetHeight';
				
			//rtl
			if(direction == -1) {
			
				for(i = length; i > 0; i--) {
			
					index = (i + offset + length) % length;
					panel = panels[index];
					
					if(horizontal) panel.setStyle('left', pos);
					else panel.setStyles({left: 0, top: pos});
					pos -= panel[side];
				}
				
				//ltr
			} else if(direction == 1) for(i = 0; i < length; i++) {
			
				index = (i + offset + length) % length;
				panel = panels[index];				
				
				if(horizontal) panel.setStyle('left', pos);
				else panel.setStyles({left: 0, top: pos});
				pos += panel[side];
			}
			
			return this
		},
		
		move: function (newTab, curTab, newIndex, oldIndex, direction) {
			
			this.fx.cancel();
			var obj = {}, 
				options = this.options,
				horizontal = options.mode == 'horizontal',
				property = horizontal ? 'offsetLeft' : 'offsetTop',  
				offset,
				opacity = options.opacity || .7;
			
			if(oldIndex != undefined && options.circular) this.reorder(oldIndex, direction);
			
			offset = newTab[property];
		
			this.panels.each(function(panel, index) {
			
				obj[index] = horizontal ? {opacity: opacity, left:[panel[property], panel[property] - offset]} : {opacity: opacity, top:[panel[property], panel[property] - offset]};
		
			});
			
			if(!options.useOpacity) $each(obj, function (k) { delete k.opacity });
			
			this.fx.start(obj).chain(function () {
				
				newTab.tween('opacity', 1)
				
			}.bind(this));
			
			this.container.morph({height: newTab.offsetHeight, width: newTab.offsetWidth})
		}
	});

