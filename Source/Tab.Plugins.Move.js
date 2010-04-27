/*
---
script: Tabs.Plugins.Move.js
license: MIT-style license.
description: Move - swap tab horizontally or vertically.
copyright: Copyright (c) 2008 Thierry Bela
authors: [Thierry Bela]

requires: 
  tab:0.1.3.2: 
  - Tab
provides: [Tab.plugins.Move]
...
*/

	Tab.prototype.plugins.Move = new Class({
		options: {
			/*
				circular: false, //not used
				reverse: false, //not used
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
			this.panels = panels;
			
			this.fx = new Fx.Elements(panels, $merge(this.fx, fx));
			
			var pos = 0;
			
			this.panels.each(function(panel) {
			
				panel.setStyles({position: 'absolute', display: 'block'});
				
				if(this.options.mode == 'horizontal') {
					
					panel.setStyle('left', pos);
					pos += panel.offsetWidth
				} else {
				
					panel.setStyles({left: 0, top: pos});
					pos += panel.offsetHeight
				}
				
			}, this);
			
			this.container = panels[0].getParent().setStyles({overflow: 'hidden', position: 'relative', width: panels[0].offsetWidth, height: panels[0].offsetHeight})
		},
		move: function (newTab, curTab, newIndex, oldIndex) {
			
			this.fx.cancel();
			var obj = {}, 
				options = this.options,
				panels = this.panels,
				horizontal = options.mode == 'horizontal',
				property = horizontal ? 'offsetLeft' : 'offsetTop', 
				offset,
				//morph,
				opacity = options.opacity || .7;
			
			//buggy
			// if(options.circular && curTab) {
			
				// var i = oldIndex || 0, 
					// k = newIndex || 0,
					// l = j = panels.length, 
					// d = options.reverse ? -1 : 1,
					// index = i,
					// offsets = {};
					
				// offset = curTab[property];
				
				// do {
				
					// offsets[index] = offset;
					// offset += panels[index][property] * d;
					// index = (index + l + d) % l; 
					// j--
				// }
				// while(j > 0);
				
				// offset = offsets[k] - offsets[i];
				// panels.each(function (panel, index) {
				
					// console.log([offsets[index], offsets[index] - offset]);
					// obj[index] = horizontal ? {opacity: opacity, left:[offsets[index], offsets[index] - offset]} : {opacity:opacity, top:[offsets[index], offsets[index] - offset]};
					
				// })
				
			//} else {
			
				offset = newTab[property];
				panels.each(function(panel, index) {
				
					obj[index] = horizontal ? {opacity: opacity, left:[panel[property], panel[property] - offset]} : {opacity: opacity, top:[panel[property], panel[property] - offset]};
			
				});
			//}
			
			if(!options.useOpacity) $each(obj, function (k) { delete k.opacity });
			
			this.fx.start(obj).chain(function () {
				newTab.tween('opacity', 1);
			});
			
			this.container.morph({height: newTab.offsetHeight, width: newTab.offsetWidth})
		}
	});

