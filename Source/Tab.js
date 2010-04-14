/*
---
script: Tab.js
license: MIT-style license.
description: Tab - Minimalistic but extensible tab swapper.
copyright: Copyright (c) 2008 Thierry Bela
authors: [Thierry Bela]

requires: 
  core:1.2.3: 
  - Class.Extras
  - Element.Event
  - Element.Style
  - Element.Dimensions
  - Fx.Morph
  - Array
provides: [Tab, Tab.plugins.None]
...
*/

	var Tab = new Class({ 
		
			options: {
				
			/* 
				onCreate: $empty,
				onChange: $empty,	
				container: null,
				selector: '',
				tabs: [],
				current: 0, //default selected
				
				params: {
				
							//animation plugin parameters
				},
			*/
				fx: {
					
					//Fx parameters
					transition:	'pow:in:out'
				},
				inactiveClass: '', //unselected tab
				activeClass: '', //selected tab
				animation: 'None'
			},
			current: 0,
			Implements: [Options, Events],
			
			initialize: function(options) {

				this.addEvents({
				
					onChange: function(newPanel, oldPanel, index, oldIndex) {
						
						var _new = this.tabs[index], _old = this.tabs[oldIndex], options = this.options
						
						if(_old) _old.removeClass(options.activeClass).addClass(options.inactiveClass);
						if(_new) _new.removeClass(options.inactiveClass).addClass(options.activeClass);
						
						this.selected = newPanel;
						this.current = index
					}.bind(this)
						
				}).setOptions(options);
				
				options = this.options;
				
				this.tabs = $$(options.tabs) ;
				this.panels = $(options.container).getChildren(options.selector);
				
				this.tabs.each(function (el, index) {
				
					el.set({		
									
						styles: {cursor: 'pointer'}, 
						events: {
							click: function(e) { e.stop(); this.setSelectedIndex(index) }.bind(this)						
						}
					}).addClass(options.inactiveClass).removeClass(options.activeClass);
					
				}, this);
				
				this.anim = new this.plugins[options.animation](this.panels, options.params, options.fx);
				
				var current = options.current || 0;
				
				this.fireEvent('onCreate', [this.panels[current], current]);
				this.setSelectedIndex(current || 0);	
				
				return this
			},
			
			next: function () {
			
				return this.setSelectedIndex((this.getSelectedIndex() + this.panels.length + 1) % this.panels.length);
			},
			
			previous: function () {
			
				return this.setSelectedIndex((this.getSelectedIndex() + this.panels.length - 1) % this.panels.length);
			},
			
			getSelectedIndex: function() { return this.current; },
			
			setSelectedIndex: function(index) {

				var current = this.current,
					curPanel = this.panels[current],
					newPanel = this.panels[index],
					params = [newPanel, curPanel, index, current];
							
				if(this.current == index || this.selected == newPanel || index < 0 || index >= this.panels.length) return this;
							
				this.anim.move.apply(this.anim, params);
				
				return this.fireEvent('onChange', params)
			}
		});
	
	//default plugin
	Tab.prototype.plugins = {
	
		None: new Class({
		
			initialize: function (panels) {
			
				panels.each(function (el, index) {
				
					el.setStyle('display', index == 0 ? 'block' : 'none')
				})
			},
			move: function (newPanel, oldPanel) {
			
				newPanel.setStyle('display', 'block');
				if(oldPanel) oldPanel.setStyle('display', 'none')
			}
		})
	};
	
