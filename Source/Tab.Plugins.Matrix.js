/*
---
script: Tabs.Plugins.Matrix.js
license: MIT-style license.
description: Matrix - provide many effects like floom and jQuery nivoSlider.
copyright: Copyright (c) 2008 Thierry Bela
authors: [Thierry Bela]

requires: 
  tab:0.1.1.1: 
  - Tab
provides: [Tab.plugins.Matrix]
...
*/
	Array.implement({
	
		shuffle: function () {
		
			var v, i, k;
			
			for(i = 0; i < this.length; i++) {
			
				k = $random(0, this.length - 1);
				
				if(k != i) {
					v = this[i];
					this[i] = this[k];
					this[k] = v
				}				
			}
			
			return this
		}
	});
	
	Tab.prototype.plugins.Matrix = new Class({
		options: {
		
				random: true,
				transitions: ['grow', 'floom',  'wave', 'lines', 'chains'],
				mode: 'horizontal',
				//The matrix
				amount: 8, //slices
				fragments: 3 //slices fragments
			},
		fx: {
		
			duration: 75
		},
		initialize: function(panels, options, fx) {
			
			this.options = $merge(this.options, options);
			this.options.transitions = $splat(this.options.transitions);
			this.panels = panels;
			this.fx = $merge(this.fx, fx);
			
			var size, img, images = [];
				
			this.slides = [];
			
			this.current = 0;
			this.container = $(panels[0]).setStyle('display', 'block').getParent();
			this.parents = [];
	
			panels.each(function (el) {
			
				img = el.get('tag') == 'img' ? el : el.getElement('img');
				images.push(img);
				
				this.slides.push({
				
					image: img.src
				})
				
			}, this);
			
			Asset.images(this.slides.map(function (el) { return el.image }), {
					
						onComplete: function () {
							panels[0].setStyles({display: 'block'})
							
							size = this.size = this.container.getSize();
							
							this.slices = {
								els: {},
								height: size.y,
								width: size.x,
								fragments: this.options.fragments
							};	
								
							this.container.setStyles({width: size.x, height: size.y, position: 'relative', overflow: 'hidden'});
										
							panels.each(function (el, index) {
							
								img = images[index];
								
								this.parents.push(img.getParent().setStyles({display: 'block', height: size.y, width: size.x}))
								img.dispose();
								
								el.setStyles({display: 'block', opacity: 0, zIndex: 1, position: 'absolute', left: 0, top: 0})
							}, this);
							
							for(var i = 0; i < this.options.amount; i++) this.slices.els[i] = [];
							
							this.setMode(this.options.mode);
							this.preloaded = true;
							this.move(panels[this.current], '', this.current, '')
							
						}.bind(this)
					}
				)
		},

		move: function (newTab, curTab, newIndex, oldIndex) { 

			if(this.preloaded) {
					
				var time = 0, 
					i, 
					j,
					matrix = [],
					method, 
					options = this.options,
					slices = this.slices,
					transition = options.transitions.shuffle()[0],
					vertical,
					bg;
				
				this.current = newIndex;
				
				for(i = 0; i < options.amount; i++) {
					
					for(j = 0; j < options.fragments; j++) matrix.push({index: i, fragment: j});
				}
				
				if(options.random) {
				
					this.setMode(['vertical', 'horizontal'].shuffle()[0]);
					method = ['reverse', 'shuffle', false].shuffle()[0];
					
					//randomize order
					if(method) matrix[method]()
				}
				
				vertical = options.mode == 'vertical';
				bg = {'background-image': 'url(' + this.slides[newIndex].image + ')'};
				
				if(curTab) curTab.tween('opacity', 0);
				newTab.tween('opacity', 1);
				
				matrix.each(function (item, index) {
						
					i = item.index;
					
					// create the slices
					if(slices.els[i].length > 0) slices.els[i].each(function (el) { el.destroy() });
							
					(function(item, vertical, styles, transition, step) {
			
							this[transition](item, vertical, options, slices, styles);
							
							// move to the next slide
							if (step) (function() {		
							
											// apply the image to the background
											this.container.setStyles(bg);
											
											// destory slices when durations finishes
											$each(slices.els, function(slice){ slice.each(function (el) { el.destroy() }) })
											
										}).delay(Math.max(time, this.fx.duration * 4) + 1000, this);
										
						}).delay(20 + time, this, [item, vertical, $merge(this[options.mode](item), bg), transition, index == options.amount - 1]);
					time += 50 
				}, this);
				
				//not ready
			} else this.current = newIndex
		},
			
		setMode: function (mode) {
		
			var slices = this.slices,
				size = this.size;
			
			$extend(slices, {
					width: mode == 'vertical' ? size.x / this.options.amount : size.x / slices.fragments,
					height: mode == 'vertical' ? size.y / slices.fragments : size.y / this.options.amount
				});
			
			this.options.mode = mode;
			
			return this
		},

		horizontal: function(item){
		
			var slices = this.slices;
			
			return {
				'background-position': '-' + (item.fragment * slices.width) + 'px -' + (this.slices.height * item.index) + 'px'
			};	
		},
		
		vertical: function(item){
			
			var slices = this.slices;
			
			return {
				'background-position': '-' + (this.slices.width * item.index) + 'px -' + (item.fragment * slices.height) + 'px'
			};
		},
		
		coordinates: function (item, vertical, raw) {

			var slice = this.slices;
			
			return raw ? {

					left: vertical ? item.index * slice.width : item.fragment * slice.width,
					top: vertical ? item.fragment * slice.height : item.index * slice.height
				}
				:
				{

					left: vertical ? [0, item.index * slice.width] : [0, item.fragment * slice.width],
					top: vertical ? [0, item.fragment * slice.height] : [0, item.index * slice.height]
				}
		},
		//
		
		/*
		
			transitions
		*/
		
		chains: function (item, vertical, options, slice, styles) {
		
			var morph = $merge(
							{opacity: [0, 1]}, 
							this.coordinates(item, vertical, true)
						),
						coord = vertical ? 'top' : 'left',
						scoord = vertical ? 'left' : 'top',
				styles = $merge(styles, {
					opacity: 0,
					width: slice.width,
					height: slice.height,
					position: 'absolute',
					zIndex: 0
				}),
				start = slice[vertical ? 'height' : 'width'] + morph[coord];
				
			styles[scoord] = morph[scoord];
			//vertical: top: dynamic, left: fixed
			morph[coord] = [item.index % 2 == 0 ? - start : start, morph[coord]];
			
			slice.els[item.index].push(new Element('div', {
			
				morph: {
					duration: this.fx.duration * 4
				},
				styles: styles
			}).inject(this.container, 'top').morph(morph))
		},
		
		//todo: reverse effect
		lines: function (item, vertical, options, slice, styles) {
		
			var morph = $merge(
							{opacity: [0, 1]}, 
							this.coordinates(item, vertical, true)
						),
						coord = vertical ? 'top' : 'left',
						scoord = vertical ? 'left' : 'top',
				styles = $merge(styles, {
					opacity: 0,
					width: slice.width,
					height: slice.height,
					position: 'absolute',
					zIndex: 0
				});
				
			styles[scoord] = morph[scoord];
			//vertical: top: dynamic, left: fixed
			morph[coord] = [-slice[vertical ? 'height' : 'width'] - morph[coord], morph[coord]];
			
			slice.els[item.index].push(new Element('div', {
			
				morph: {
					duration: this.fx.duration * 4
				},
				styles: styles
			}).inject(this.container, 'top').morph(morph))
		},
		
		//todo: reverse effect
		grow: function (item, vertical, options, slice, styles) {
		
			var morph = {
				opacity: 1,
				width: vertical ? slice.width : [0, slice.width],
				height: vertical ? [0, slice.height] : slice.height
			};
			
			morph['margin-' + ['left', 'top', 'right', 'bottom'].shuffle()[0]] = [20, 0];
			slice.els[item.index].push(new Element('div', {
				morph: {
					duration: this.fx.duration * 4
				},
				styles: $merge(styles, { 
							opacity: 0,
							position: 'absolute',
							zIndex: 0
						}, this.coordinates(item, vertical, true))
			}).inject(this.container, 'top').morph(morph))
		},
		
		//very cool
		wave: function (item, vertical, options, slice, styles) {
		
			slice.els[item.index].push(new Element('div', {
				morph: {
					duration: this.fx.duration * 4
				},
				styles: $merge(styles, { 
					opacity: 0,
					position: 'absolute',
					width: slice.width,
					height: slice.height,
					zIndex: 0
				})
			}).inject(this.container, 'top').morph($merge({opacity: 1}, this.coordinates(item, vertical))))
		},
		
		//reproduce the floom effect
		floom: function (item, vertical, options, slice, styles) {
		
			var morph = {
				opacity: 1
			};
			
			morph['margin-' + ['left', 'top', 'right', 'bottom'].shuffle()[0]] = [20, 0];
			slice.els[item.index].push(new Element('div', {
			
				morph: {
					duration: this.fx.duration * 4
				},
				styles: $merge(styles, {
					opacity: 0,
					width: slice.width,
					height: slice.height,
					position: 'absolute',
					zIndex: 0
				}, this.coordinates(item, vertical, true))
			}).inject(this.container, 'top').morph(morph))
		}
	});
	