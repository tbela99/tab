
/*
Script: Tabber.js
	Tabs manager
	
	License: MIT-style license.
	Copyright: Copyright (c) 2008 Thierry Bela
	License:
		MIT-style license.

	Authors:
		Thierry Bela

*/

/**
 * @author thierry bela {@link bntfr@yahoo.fr}
 * @todo add/remove panels
 * 
 * @version 0.1.3
 *
 * complete rewrite. Tabs is no longer a global object but a class. all extra functionalities have been dropped and some method has been renamed.
 *
 * @version 0.1.2.1
 * 
 * dropped dynamic content load, this can be performed by user with the onChange event
 * added new plugins Reveal, Stack
 * fixed position of element with plugin Fade when the page is resized
 * createTabs accept only an object as arguments, the tab panel is no longer mandatory
 *
 * version 0.1.2
 *
 * tested with IE6+, FF2, Opera9, Chrome
 * que la force soit avec vous!
 *
 * upgrade to mootools 1.2
 * some code cleanup
 * small bug fixes
 * change _stopSlide in now stopSlide and is public
 * added startSlide
 *
 * version 0.1.2
 *
 * added:
 * tabs title are turned into tooltips
 * event listener
 * tabs and content may be in different containers
 * auto slide content
 * plugin animSlide
 * plugin animCards
 * show content when mouse is over a tab
 *
 * version 0.1.1
 * 
 * added:
 * plugins support
 */

	(function ($) {
	
		this.Tab = new Class({ 
		
			options: {
				
			/* 
				onCreate: $empty,
				onChange: $empty,	
				
				panel: elm,
				selector: '',
				tabs: [],
				current: 0, //default selected
				
				//animation plugin parameters
				params: {
				
				},
				//Fx parameters
			*/
				fx: {
				
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
				
					onChange: function(newTab, oldTab, index, oldIndex) {
						
						var currentTab = this.tabs[oldIndex],
							tab = this.tabs[index];
							
						if(currentTab) currentTab.removeClass(this.options.activeClass).addClass(this.options.inactiveClass);
						if(tab) tab.removeClass(this.options.inactiveClass).addClass(this.options.activeClass);
						
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
			
			/*
				display next tabs
			 */
			next: function () {
			
				return this.setSelectedIndex((this.getSelectedIndex() + this.panels.length + 1) % this.panels.length);
			},
			
			/*
				display previous tab
			 */
			previous: function () {
			
				return this.setSelectedIndex((this.getSelectedIndex() + this.panels.length - 1) % this.panels.length);
			},
			
			/**
			 * @since  0.1.2 beta
			 */
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
	
	//default
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
	
