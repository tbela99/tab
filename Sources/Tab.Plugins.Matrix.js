
/*
Script: Tabs.Plugins.Slice.js

	inspired by Floom by Oskar Krawczyk (http://nouincolor.com/)
	
	License: MIT-style license.
	Copyright: Copyright (c) 2009 Thierry Bela
	License:
		MIT-style license.

	Authors:
		Thierry Bela
	
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
			/*
				random: false,
			*/
				transitions: ['grow', 'floom',  'wave'],
				axis: 'horizontal',
				//The matrix
				amount: 24, //slices
				fragments: 3 //slices fragments
			},
		fx: {
		
			duration: 250
		},
		initialize: function(panels, options, fx) {
			
			this.options = $merge(this.options, options);
			this.options.transitions = $splat(this.options.transitions);
			this.panels = panels;
			this.fx = $merge(this.fx, fx);
			
			var size, img, link, props;
			this.slides = [];
			
			this.current = 0;
			this.container = $(panels[0]).setStyle('display', 'block').getParent();
	
			panels.each(function (el) {
			
				img = el.get('tag') == 'img' ? el : el.getElement('img');
				
				props = {
				
					image: img.src,
					title: img.title
				};
				
				// link = img.getParent('a');
				
				// if(link) props.url = a.href;
				
				this.slides.push(props)
				
			}, this);
			
			Asset.images(this.slides.map(function (el) { return el.image }), {
					
						onComplete: function () {
							
							panels[0].setStyles({display: 'block'});
							size = this.size = this.container.getSize();
							
							this.container.setStyles({width: size.x, height: size.y, position: 'relative', overflow: 'hidden'});
							
							this.slices = {
								els: {},
								height: size.y,
								width: size.x,
								fragments: this.options.fragments
							};	
							
							for(var i = 0; i < this.options.amount; i++) this.slices.els[i] = [];
							
							this.setMode(this.options.axis).panels.each(function (el) { el.dispose() });
							this.preloaded = true;
							this.move('', '', this.current, '')
							
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
					
					var items = [];
					
					for(j = 0; j < options.fragments; j++) matrix.push({index: i, fragment: j});
				}
						
				if(options.random) {
				
					this.setMode(['vertical', 'horizontal'].shuffle()[0]);
					method = ['reverse', 'shuffle', false].shuffle()[0];
					
					//randomize order
					if(method) matrix[method]()
				}
				
				vertical = options.axis == 'vertical';
				bg = {'background-image': 'url(' + this.slides[newIndex].image + ')'};
				
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
										
						}).delay(20 + time, this, [item, vertical, $merge(this[options.axis](item), bg), transition, index == options.amount - 1]);
					time += 50 
				}, this);
				
				//not ready
			} else this.current = newIndex
		},
			
		setMode: function (mode) {
		
			var slices = this.slices;
			
			$extend(slices, {
					width: mode == 'vertical' ? this.size.x / this.options.amount : this.size.x / slices.fragments,
					height: mode == 'vertical' ? this.size.y / slices.fragments : this.size.y / this.options.amount
				});
			
			this.options.axis = mode;
			
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
		
		/*
		
			transitions
		*/
		
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
							position: 'absolute'
						}, this.coordinates(item, vertical, true))
			}).inject(this.container).morph(morph))
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
					height: slice.height
				})
			}).inject(this.container).morph($merge({opacity: 1}, this.coordinates(item, vertical))))
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
					position: 'absolute'
				}, this.coordinates(item, vertical, true))
			}).inject(this.container).morph(morph))
		}
	});
	