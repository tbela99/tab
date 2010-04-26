/*
---
script: Tabs.Plugins.Matrix.js
license: MIT-style license.
description: Matrix - provide many effects like floom and jQuery nivoSlider.
copyright: Copyright (c) 2008 Thierry Bela
authors: [Thierry Bela]

requires: 
  tab:0.1.3.1: 
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
				transitions: ['grow', 'floom', 'wave', 'lines', 'chains', 'fold', 'fall', 'explode', 'implode', 'out', 'split'],
				sort: ['none', 'reverse', 'shuffle'],
				mode: 'horizontal', //vertical | both
				//The matrix
				amount: 8, //slices
				fragments: 3 //slices fragments
			},
		fx: {
		
			duration: 300
		},
		initialize: function(panels, options, fx) {
			
			this.options = $merge(this.options, options);
			
			
			this.options.randomMode = this.options.mode == 'both';
			this.options.transitions = $splat(this.options.transitions);
			this.options.sort = $splat(this.options.sort);
			this.panels = panels;
			this.fx = $merge(this.fx, fx);
			this.fx.duration = this.fx.duration.toInt();
			
			var size, img, images = [];
				
			this.slides = [];
			
			this.current = 0;
			this.previous = 0;
			
			//complete queue
			//this.queue = [];
			//this.tmp = {};
			this.container = panels[0].setStyles('display', 'block').getParent();
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
								
							this.container.setStyles({width: size.x, height: size.y, position: 'relative', overflow: 'hidden', 'background-repeat': 'no-repeat'});
										
							panels.each(function (el, index) {
							
								img = images[index];
								
								this.parents.push(img.getParent().setStyles({display: 'block', height: size.y, width: size.x}))
								img.destroy();
								
								el.setStyles({display: 'block', opacity: 0, zIndex: 2, position: 'absolute', left: 0, top: 0})
							}, this);
							
							for(var i = 0; i < this.options.amount; i++) this.slices.els[i] = [];
							
							this.setMode(this.options.mode).preloaded = true;
							this.move(panels[this.current], '', this.current, '')
							
						}.bind(this)
					}
				)
		},

		move: function (newTab, curTab, newIndex, oldIndex) { 

			if(curTab) curTab.tween('opacity', 0);
			newTab.tween('opacity', 1);
			
			this.current = newIndex;
			this.previous = oldIndex || 0;
			
			if(this.preloaded) {
					
				var time = 0, 
					i, 
					j,
					matrix = [],
					method, 
					options = this.options,
					slices = this.slices,
					transition,
					vertical,
					bg,
					queue = this.queue = [],
					tmp = this.tmp = {};
				
				for(i = 0; i < options.amount; i++) {
					
					for(j = 0; j < options.fragments; j++) matrix.push({index: i, fragment: j});
				}
				
				if(options.random) {
				
					method = options.sort.getRandom();
					transition = options.transitions.getRandom()
					
				} else {
				
					method = options.sort.shift();
					options.sort.push(method);
					transition = options.transitions.shift();
					options.transitions.push(transition);
				}
				
				//randomize order
				if(method && matrix[method]) matrix[method]()
					
				if(options.randomMode) this.setMode('both');
				
				vertical = options.mode == 'vertical';
				bg = {'background-image': 'url(' + this.slides[newIndex].image + ')'};
				
				matrix.each(function (item, index) {
						
					(function(item, vertical, styles, transition, step) {
			
							this[transition](item, vertical, options, slices, styles);
							
							// move to the next slide
							if (step) (function() {		
							
								// apply the image to the background
								this.container.setStyles(bg);
								
								time = 0;
								queue.each(function (fn) {
								
									fn.delay(time + 25)
									time += 50
								});
								
								(function () {
									
									$each(slices.els, function(slice) { slice.each(function (el) { el.destroy() }) })
									
								}).delay(time + 25)
								
							}).delay(Math.max(time, this.fx.duration) + 100, this)
										
						}).delay(25 + time, this, [item, vertical, $merge(this[options.mode](item), bg), transition, index == options.amount - 1]);
					time += 50 
				}, this)
				
				//not ready
			}
		},
			
		setMode: function (mode) {
		
			var slices = this.slices,
				size = this.size;
			
			if(mode == 'both') mode = ['vertical', 'horizontal'].getRandom();
			
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
		
		out: function (item, vertical, options, slice, styles) {
		
			var fx = this.fx,
				coords = this.coordinates(item, vertical, true),
				div = new Element('div', {
				
					styles: $merge(styles, {
							opacity: 0, /* */
							width: slice.width,
							height: slice.height,
							position: 'absolute',
							zIndex: 0							
						},
						coords
					)
				}).inject(this.container, 'top'),
				clone = div.clone().set({
				
					opacity: 1,
					zIndex: 1,
					styles: {
						backgroundImage: 'url(' + this.slides[this.previous].image + ')'
					},
					morph: $merge(fx, {
								
							onComplete: function () {
							
								clone.destroy()
							}
						})
				}).inject(this.container);
				
			
			this.queue.push(function () {
			
				clone.morph({
					
						opacity: [1, .2],
						width: 0,
						height: 0
					}
				)
			}.bind(this));
				
			slice.els[item.index].push(div.set({opacity: 1}))
		},
		
		implode: function (item, vertical, options, slice, styles) {
		
			var fx = this.fx,
				coords = this.coordinates(item, vertical, true),
				div = new Element('div', {
				
					styles: $merge(styles, {
							opacity: 0, /* */
							width: slice.width,
							height: slice.height,
							position: 'absolute',
							zIndex: 0							
						},
						coords
					)
				}).inject(this.container, 'top'),
				clone = div.clone().set({
				
					opacity: 1,
					zIndex: 1,
					styles: {
						backgroundImage: 'url(' + this.slides[this.previous].image + ')'
					},
					morph: $merge(fx, {
								
							onComplete: function () {
							
								(function () { clone.destroy() }).delay(50)
							}
						})
				}).inject(this.container);
				
			
			this.queue.push(function () {
			
				clone.morph({
					
						opacity: [1, .5],
						left: (this.size.x.toInt() - slice.width) / 2,
						top: (this.size.y.toInt() - slice.height) / 2
					}
				)
			}.bind(this));
				
			slice.els[item.index].push(div.set({opacity: 1}))
		},
		
		split: function (item, vertical, options, slice, styles) {
		
			var fx = this.fx,
				coords = this.coordinates(item, vertical, true),
				div = new Element('div', {
				
					styles: $merge(styles, {
							opacity: 0, /* */
							width: slice.width,
							height: slice.height,
							position: 'absolute',
							zIndex: 0							
						},
						coords
					)
				}).inject(this.container, 'top'),
				clone = div.clone().set({
				
					opacity: 1,
					zIndex: 1,
					styles: {
						backgroundImage: 'url(' + this.slides[this.previous].image + ')'
					},
					morph: $merge(fx, {
								
							onComplete: function () {
							
								clone.destroy()
							}
						})
				}).inject(this.container);
				
			
			this.queue.push(function () {
			
				clone.morph({
					
						opacity: [1, .2],
						left: $random(-slice.width, this.size.x.toInt() + slice.width),
						top: $random(-slice.height, this.size.y.toInt() + slice.height)
					}
				)
			}.bind(this));
				
			slice.els[item.index].push(div.set({opacity: 1}))
		},
		
		explode: function (item, vertical, options, slice, styles) {
		
			var fx = this.fx,
				tmp = this.tmp,
				coords = this.coordinates(item, vertical, true),
				div = new Element('div', {
				
					styles: $merge(styles, {
							opacity: 0, /* */
							width: slice.width,
							height: slice.height,
							position: 'absolute',
							zIndex: 0							
						},
						coords
					)
				}).inject(this.container, 'top'),
				clone = div.clone().set({
				
					opacity: 1,
					zIndex: 1,
					styles: {
						backgroundImage: 'url(' + this.slides[this.previous].image + ')'
					}
				}).inject(this.container);
				
			tmp.clones = tmp.clones || [];
			tmp.morph = tmp.morph || {};
				
			if(tmp.clones.length == 0) {
				
				this.queue.push(function () {
					
					new Fx.Elements(tmp.clones, $merge(fx, {
					
						duration: Math.max(fx.duration, 2000),
						onComplete: function () {
						
							tmp.clones.each(function (el) { el.destroy() })
						}
					})).start(tmp.morph)
				}.bind(this))
			};
			
			tmp.morph[tmp.clones.length] = {
						
							opacity: 0,
							left: $random(-slice.width, this.size.x.toInt() + slice.width),
							top: $random(-slice.height, this.size.y.toInt() + slice.height)
						};
			tmp.clones.push(clone);
						
			slice.els[item.index].push(div.set({opacity: 1}))
		},
		
		fall: function (item, vertical, options, slice, styles) {
		
			var fx = this.fx,
				div = new Element('div', {
				
					styles: $merge(styles, {
							opacity: 0, /* */
							width: slice.width,
							height: slice.height,
							position: 'absolute',
							zIndex: 0
							
						},
						this.coordinates(item, vertical, true)
					)
				}).inject(this.container, 'top'),
				clone = div.clone().inject(this.container).set({
				
					opacity: 1,
					zIndex: 1,
					styles: {
						backgroundImage: 'url(' + this.slides[this.previous].image + ')'
					},
					morph: $merge(fx, {	
							onComplete: function () {
							
								clone.destroy()
							}
						})
				});
				
			morph = {opacity: .2};
				
			if(vertical) morph.top = [-slice.height, this.size.y.toInt() + slice.height].getRandom();
			else morph.left = [-slice.width, this.size.x.toInt() + slice.width].getRandom();
				
			this.queue.push(function () {
			
				clone.morph(morph)
			});
				
			slice.els[item.index].push(div.set({opacity: 1, zIndex: 0}))
		},
		
		fold: function (item, vertical, options, slice, styles) {
		
			styles = $merge(styles, {
						opacity: 0, /* */
						width: slice.width,
						height: slice.height,
						position: 'absolute',
						zIndex: 0
					},
					this.coordinates(item, vertical, true)
				);
				
			var morph = {opacity: 1},
				prop = vertical ? 'width' : 'height';
				
			morph[prop] = styles[prop];	
			styles[prop] = 0;
			
			slice.els[item.index].push(new Element('div', {
			
				morph: this.fx,
				styles: styles
			}).inject(this.container, 'top').morph(morph))
		},
		
		chains: function (item, vertical, options, slice, styles) {

			styles = $merge(styles, {
					opacity: 0,
					width: slice.width,
					height: slice.height,
					position: 'absolute',
					zIndex: 0
			});

			var morph = $merge(
							{opacity:1}, 
							this.coordinates(item, vertical, true)
						),
						coord = vertical ? 'top' : 'left',
						scoord = vertical ? 'left' : 'top',
				start = slice[vertical ? 'height' : 'width'] + morph[coord];
				
			styles[scoord] = morph[scoord];
			//vertical: top: dynamic, left: fixed
			morph[coord] = [item.index % 2 == 0 ? - start : start, morph[coord]];
			
			slice.els[item.index].push(new Element('div', {
			
				morph: this.fx,
				styles: styles
			}).inject(this.container, 'top').morph(morph))
		},
		
		lines: function (item, vertical, options, slice, styles) {
                        
			styles = $merge(styles, {
				opacity: 0,
				width: slice.width,
				height: slice.height,
				position: 'absolute',
				zIndex: 0
			});
                                
			var morph = $merge(
							{opacity: 1}, 
							this.coordinates(item, vertical, true)
						),
						coord = vertical ? 'top' : 'left',
						scoord = vertical ? 'left' : 'top';
				
			styles[scoord] = morph[scoord];
			//vertical: top: dynamic, left: fixed
			morph[coord] = [-slice[vertical ? 'height' : 'width'] - morph[coord], morph[coord]];
			
			slice.els[item.index].push(new Element('div', {
			
				morph: this.fx,
				styles: styles
			}).inject(this.container, 'top').morph(morph))
		},
		
		grow: function (item, vertical, options, slice, styles) {
		
			var morph = {
				opacity: 1,
				width: vertical ? slice.width : [0, slice.width],
				height: vertical ? [0, slice.height] : slice.height
			};
			
			morph['margin-' + ['left', 'top', 'right', 'bottom'].getRandom()] = [20, 0];
			slice.els[item.index].push(new Element('div', {
				morph: this.fx,
				styles: $merge(styles, { 
							opacity: 0,
							position: 'absolute',
							zIndex: 0
						}, this.coordinates(item, vertical, true))
			}).inject(this.container, 'top').morph(morph))
		},
		
		wave: function (item, vertical, options, slice, styles) {
		
			slice.els[item.index].push(new Element('div', {
				morph: this.fx,
				styles: $merge(styles, { 
					opacity: 1,
					position: 'absolute',
					width: slice.width,
					height: slice.height,
					zIndex: 0
				})
			}).inject(this.container, 'top').morph($merge({opacity: 0}, this.coordinates(item, vertical))).morph({opacity: 1}))
		},
		
		floom: function (item, vertical, options, slice, styles) {
		
			var morph = {
				opacity: 1
			};
			
			morph['margin-' + ['left', 'top', 'right', 'bottom'].getRandom()] = [20, 0];
			slice.els[item.index].push(new Element('div', {
			
				morph: this.fx,
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
	