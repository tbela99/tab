/*
---
script: Tabs.Plugins.Matrix.js
license: MIT-style license.
description: Matrix - provide many effects like floom and jQuery nivoSlider.
copyright: Copyright (c) 2008 Thierry Bela
authors: [Thierry Bela]

requires: 
  tab:0.1.3.5: 
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
		
				/* per transition settings, here you go! */
				/*
				settings: {
				
					split: {
					
						params: {
						
							random: true,
							sort: ['reverse', 'none'],
							amount: 10,
							fragments: 5
						}
					},
					fold: {
					
						params: {
						
							mode: 'vertical',
							amount: 10,
							fragments: 1
						}
					},
					lines: {
					
						fx: {
						
							transition: 'bounce:out'
						}
					},
					explode: {
					
						fx: {
						
							transition: 'bounce:in'
						}
					}
				},
				
				//queuing animations
				queue: false,
				*/
				random: true,
				transitions: ['grow', 'floom', 'wave', 'lines', 'chains', 'fold', 'fall', 'explode', 'implode', 'out', 'split'],
				sort: ['none', 'reverse', 'shuffle'],
				mode: 'vertical', //horizontal | both
				//The matrix
				amount: 8, //slices
				fragments: 3 //slices fragments
			},
		fx: {
		
			duration: 800
		},
		initialize: function(panels, options, fx) {
			
			this.options = $merge(this.options, options);
			this.settings = this.options.settings || {};
			
			delete this.options.settings;
			
			/*
			
				animation queue
			*/
			this.queue = [];
			
			this.options.randomMode = this.options.mode == 'both';
			this.options.transitions = $splat(this.options.transitions);
			this.options.sort = $splat(this.options.sort);
			
			this.fx = $merge(this.fx, fx);
			this.fx.duration = this.fx.duration.toInt();
			
			//unlink
			this._options = $merge(this.options);
			this._fx = $merge(this.fx);
			
			this.panels = panels;
			
			var size, img, images = [];
				
			this.slides = [];
			
			this.current = 0;
			this.previous = 0;
			
			this.container = panels[0].setStyle('display', 'block').getParent();
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
								
								height: size.y,
								width: size.x,
								fragments: this.options.fragments
							};
							
							this.container.setStyles({width: size.x, height: size.y, position: 'relative', overflow: 'hidden', backgroundRepeat: 'no-repeat'});
										
							panels.each(function (el, index) {
							
								img = images[index];
								
								this.parents.push(img.getParent().setStyles({display: 'block', height: size.y, width: size.x}))
								img.destroy();
								
								el.setStyles({display: 'block', opacity: 0, zIndex: 2, position: 'absolute', left: 0, top: 0})
							}, this);
							
							this.setMode(this.options.mode).preloaded = true;
							this.move(panels[this.current], '', this.current, '')
							
						}.bind(this)
					}
				)
		},

		move: function (newTab, curTab, newIndex, oldIndex, force) { 

			if(curTab) curTab.tween('opacity', 0);
			newTab.tween('opacity', 1);
			
			this.current = newIndex;
			this.previous = oldIndex || 0;
			
			if(this.running || (this.queue.length > 0 && !force)) {
			
				this.queue.push(arguments);
				return
			}
			
			if(this.preloaded) {
					
				this.running = true;
				this.fx = this._fx;
				this.options = this._options;
				
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
					queue = [],
					tmp = {},
					els = {},
					settings,
					//some transitions have big latency before they begin
					delay = true;
				
				if(options.random) {
				
					method = options.sort.getRandom();
					transition = options.transitions.getRandom()
					
				} else {
				
					method = options.sort.shift();
					options.sort.push(method);
					transition = options.transitions.shift();
					options.transitions.push(transition);
				}
				
				settings = this.settings[transition];
				
				if(settings) {
					
					this.fx = $merge(this._fx, settings.fx);
					options = this.options = $merge(this._options, settings.params);
					
					options.transitions = $splat(options.transitions);
					options.sort = $splat(options.sort);
					options.randomMode = options.mode == 'both';
					this.fx.duration = this.fx.duration.toInt();
					
					if(options.random) method = options.sort.getRandom();
						
					else {
					
						method = options.sort.shift();
						options.sort.push(method)
					}
				}
								
				slices.fragments = options.fragments;
				
				for(i = 0; i < options.amount; i++) {
					
					els[i] = [];
					for(j = 0; j < options.fragments; j++) matrix.push({index: i, fragment: j});
				}
				
				//randomize order
				if(method && matrix[method]) matrix[method]();
					
				this.setMode(options.randomMode ? 'both' : options.mode);
				
				vertical = options.mode == 'vertical';
				bg = {backgroundImage: 'url(' + this.slides[newIndex].image + ')', backgroundRepeat: 'no-repeat'};	
				
				if(['out', 'implode', 'split', 'explode', 'fall'].indexOf(transition) != -1) delay = false;
				
				matrix.each(function (item, index) {
						
					(function(item, vertical, styles, transition, step) {
			
							// move to the next slide
							this[transition](item, vertical, options, slices, styles, els, queue, tmp);
							
							//finish and clean up
							if (step) (function() {		
							
								// apply the image to the background
								this.container.setStyles(bg);
								time = 0;
								queue.each(function (fn) {
								
									fn.delay(time + 25)
									time += 50
								});
								
								(function () {
									
									$each(els, function(slice) { slice.each(function (el) { el.destroy() }) });
									this.running = false;
									if(this.queue.length > 0) {
									
										(function () {
													
											var args = $A(this.queue.pop());
											if(!this.options.queue) this.queue.empty();
											args.push(true);
											this.move.apply(this, args)
										}).delay(500, this)
									}
									
								}).delay(time + 25, this)
								
							}).delay(Math.max(time, this.fx.duration) + 100, this)
										
						}).delay(delay ? 25 + time : 0, this, [item, vertical, $merge(this[options.mode](item), bg), transition, index == options.amount - 1]);
					time += 50 
				}, this)
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
				backgroundPosition: '-' + (item.fragment * slices.width) + 'px -' + (this.slices.height * item.index) + 'px'
			};	
		},
		
		vertical: function(item){
			
			var slices = this.slices;
			
			return {
				backgroundPosition: '-' + (this.slices.width * item.index) + 'px -' + (item.fragment * slices.height) + 'px'
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
		
		out: function (item, vertical, options, slice, styles, els, queue) {
		
			var fx = this.fx,
				coords = this.coordinates(item, vertical, true),
				div = new Element('div', {
				
					styles: $merge(styles, {
							width: slice.width,
							height: slice.height,
							position: 'absolute',
							zIndex: 0							
						},
						coords
					)
				}),
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
				
			
			queue.push(function () {
			
				clone.morph({
					
						opacity: [1, .2],
						width: 0,
						height: 0
					}
				)
			});
				
			els[item.index].push(div.set({opacity: 1}).inject(this.container, 'top'))
		},
		
		implode: function (item, vertical, options, slice, styles, els, queue) {
		
			var fx = this.fx,
				coords = this.coordinates(item, vertical, true),
				div = new Element('div', {
				
					styles: $merge(styles, {
							width: slice.width,
							height: slice.height,
							position: 'absolute',
							zIndex: 0							
						},
						coords
					)
				}),
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
				
			
			queue.push(function () {
			
				clone.morph({
					
						opacity: [1, .5],
						left: (this.size.x.toInt() - slice.width) / 2,
						top: (this.size.y.toInt() - slice.height) / 2
					}
				)
			}.bind(this));
				
			els[item.index].push(div.set({opacity: 1}).inject(this.container, 'top'))
		},
		
		split: function (item, vertical, options, slice, styles, els, queue) {
		
			var fx = this.fx,
				coords = this.coordinates(item, vertical, true),
				div = new Element('div', {
				
					styles: $merge(styles, {
							width: slice.width,
							height: slice.height,
							position: 'absolute',
							zIndex: 0							
						},
						coords
					)
				}),
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
				
			
			queue.push(function () {
			
				clone.morph({
					
						opacity: [1, .2],
						left: $random(-slice.width, this.size.x.toInt() + slice.width),
						top: $random(-slice.height, this.size.y.toInt() + slice.height)
					}
				)
			}.bind(this));
				
			els[item.index].push(div.set({opacity: 1}).inject(this.container, 'top'))
		},
		
		explode: function (item, vertical, options, slice, styles, els, queue, tmp) {
		
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
				}),
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
				
				queue.push(function () {
					
					new Fx.Elements(tmp.clones, $merge(fx, {
					
						duration: Math.max(fx.duration, 2000),
						onComplete: function () {
								
							(function () {
							
								tmp.clones.each(function (el) { 
								
									el.destroy() 							
								})
								
						  }).delay(50)
						}
					})).start(tmp.morph)
				})
			};
			
			tmp.morph[tmp.clones.length] = {
						
							opacity: 0,
							left: $random(-slice.width, this.size.x.toInt() + slice.width),
							top: $random(-slice.height, this.size.y.toInt() + slice.height)
						};
						
			tmp.clones.push(clone);
						
			els[item.index].push(div.set({opacity: 1}).inject(this.container, 'top'))
		},
		
		fall: function (item, vertical, options, slice, styles, els, queue) {
		
			var fx = this.fx,
				div = new Element('div', {
				
					styles: $merge(styles, {
							width: slice.width,
							height: slice.height,
							position: 'absolute',
							zIndex: 0
							
						},
						this.coordinates(item, vertical, true)
					)
				}),
				clone = div.clone().inject(this.container).set({
				
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
				});
				
			morph = {opacity: .2};
				
			if(vertical) morph.top = [-slice.height, this.size.y.toInt() + slice.height].getRandom();
			else morph.left = [-slice.width, this.size.x.toInt() + slice.width].getRandom();
				
			queue.push(function () {
			
				clone.morph(morph)
			});
				
			els[item.index].push(div.set({opacity: 1, zIndex: 0}).inject(this.container, 'top'))
		},
		
		fold: function (item, vertical, options, slice, styles, els) {
		
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
			
			els[item.index].push(new Element('div', {
			
				morph: this.fx,
				styles: styles
			}).inject(this.container, 'top').morph(morph))
		},
		
		chains: function (item, vertical, options, slice, styles, els) {

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
			
			els[item.index].push(new Element('div', {
			
				morph: this.fx,
				styles: styles
			}).inject(this.container, 'top').morph(morph))
		},
		
		lines: function (item, vertical, options, slice, styles, els) {
                        
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
			
			els[item.index].push(new Element('div', {
			
				morph: this.fx,
				styles: styles
			}).inject(this.container, 'top').morph(morph))
		},
		
		grow: function (item, vertical, options, slice, styles, els) {
		
			var morph = {
				opacity: 1,
				width: vertical ? slice.width : [0, slice.width],
				height: vertical ? [0, slice.height] : slice.height
			};
			
			morph['margin-' + ['left', 'top', 'right', 'bottom'].getRandom()] = [20, 0];
			els[item.index].push(new Element('div', {
				morph: this.fx,
				styles: $merge(styles, { 
							opacity: 0,
							position: 'absolute',
							zIndex: 0
						}, this.coordinates(item, vertical, true))
			}).inject(this.container, 'top').morph(morph))
		},
		
		wave: function (item, vertical, options, slice, styles, els, queue) {
		
			var morph = new Element('div', {
				morph: $merge(this.fx, {duration: this.fx.duration / 2}),
				styles: $merge(styles, { 
					opacity: 1,
					position: 'absolute',
					width: slice.width,
					height: slice.height,
					zIndex: 0
				})
			}).inject(this.container, 'top').morph($merge({opacity: 0}, this.coordinates(item, vertical))).morph({opacity: 1});
			
			queue.push(function () {
			
				morph.destroy()
			})
		},
		
		floom: function (item, vertical, options, slice, styles, els) {
		
			var morph = {
				opacity: 1
			};
			
			morph['margin-' + ['left', 'top', 'right', 'bottom'].getRandom()] = [20, 0];
			els[item.index].push(new Element('div', {
			
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
	