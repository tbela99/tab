
/*
Script: Tab.js
	
	License: MIT-style license.
	Copyright: Copyright (c) 2008 Thierry Bela
	License:
		MIT-style license.

	Authors:
		Thierry Bela

*/

	(function ($) {
	
		this.Tab = new Class({ 
		
			options: {
				
			/* 
				onCreate: $empty,
				onChange: $empty,					
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
				
					onChange: function(newTab, oldTab, index) {
						
						if(oldTab) oldTab.removeClass(this.options.activeClass).addClass(this.options.inactiveClass);
						if(newTab) newTab.removeClass(this.options.inactiveClass).addClass(this.options.activeClass);
						
						this.selected = newTab;
						this.current = index
					}.bind(this)
						
				}).setOptions(options);
				
				options = this.options;
				
				this.container = $(options.container);
				this.tabs = $$(options.tabs) ;
				this.panels = $(options.panel).getChildren(options.selector || '');
				
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
					curTab = this.panels[current],
					newTab = this.panels[index],
					params = [newTab, curTab, index, current];
							
				if(this.current == index || this.selected == newTab || index < 0 || index >= this.panels.length) return this;
							
				this.anim.move.apply(this.anim, params);
				
				return this.fireEvent('onChange', params)
			}
		})
		
	})(document.id);
	
	//default plugin
	Tab.prototype.plugins = {
	
		None: new Class({
		
			initialize: function (panels) {
			
				panels.each(function (el, index) {
				
					el.setStyle('display', index == 0 ? 'block' : 'none')
				})
			},
			move: function (newTab, oldTab) {
			
				newTab.setStyle('display', 'block');
				if(oldTab) oldTab.setStyle('display', 'none')
			}
		})
	};
	
