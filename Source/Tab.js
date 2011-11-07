/*
---
script: Tab.js
license: MIT-style license.
description: Tab - Minimalistic but extensible tab swapper.
copyright: Copyright (c) 2008 Thierry Bela
authors: [Thierry Bela]

requires:
  core:1.3:
  - Class.Extras
  - Element.Event
  - Element.Style
  - Element.Dimensions
  - Fx.Morph
  - Array
provides: [Tab, Tab.plugins.None]
...
*/
!function(context, undefined) {

"use strict";

	context.Tab = new Class({

		current: -1,
		options: {

		/*
			onCreate: $empty,
			onChange: $empty,
			container: null,
			selector: '',
			tabs: [],

			params: {

						//animation plugin parameters
			},
		*/
			current: -1, //default selected
			link: 'chain',
			fx: {

				//Fx parameters
				transition:	'sine:out',
				link: 'chain'
			},
			inactiveClass: '', //unselected tab
			activeClass: '', //selected tab
			animation: 'None'
		},
		queue: [],
		Implements: [Options, Events],

		initialize: function(options) {

			options = this.setOptions(options).options;

			this.container = options.container = $(options.container).set('morph', {link: 'cancel'});

			var current = options.current,
				events = this.events = {

						click: function(e) {

							e.stop();

							var target = e.target,
								index = this.tabs.indexOf(target);

							while(target && index == -1) {

								target = target.parentNode;
								index = this.tabs.indexOf(target)
							}

							if(index == -1) return;

							//detect direction. inspired by moostack
							var forward = this.current < index ? index - this.current : this.panels.length - this.current + index,
								backward = this.current > index ? this.current - index : this.current + this.panels.length - index;

							this.setSelectedIndex(index, Math.abs(forward) <= Math.abs(backward) ? 1 : -1)

						}.bind(this)
					};

			this.tabs = $$(options.tabs).map(function (tab) {
			
				return tab.set({styles: {cursor: 'pointer'}, events: events})
			});
			
			this.panels = this.container.getChildren(options.selector);
			if(this.panels.length > 0 && !isNaN(this.options.current) && this.options.current > 0) this.current = 0;

			this.anim = new this.plugins[options.animation](this.panels, Object.append({}, options.params, {container: options.container, onResize: this.resize.bind(this), onChange: this.change.bind(this), onComplete: this.complete.bind(this) }), options.fx);
			if(this.panels.length > 0) this.setSelectedIndex(Math.max(0, current))
		},

		add: function (panel, tab, index) {

			panel = $(panel);
			tab = $(tab);

			if(tab) tab.set({styles: {cursor: 'pointer'}, events: this.events});

			if(this.panels.indexOf(panel) != -1) return this;

			if(index == undefined) index = this.panels.length;
			index = Math.min(index, this.panels.length);

			switch(index) {

				case 0 :
						if(this.panels.length > 0) {

							this.panels.unshift(panel.inject(this.panels[0], 'before'));
							if(tab) this.tabs.unshift(tab);
						}
						
						else {
						
							this.panels.push(panel.inject(this.container));
							//you must inject first tab somewhere before or it will not be in the DOM
							if(tab) this.tabs.push(tab);
						}

						break;
				default:
						this.panels.splice(index, 0, panel.inject(this.panels[index - 1], 'after'));
						if(tab) this.tabs.splice(index, 0, tab);
						break;
			}

			if(this.anim.add) this.anim.add(panel);
			this.current = this.panels.indexOf(this.selected);

			if(this.current == -1 && this.panels.length > 0) this.setSelectedIndex(0);
			
			return this
		},

		remove: function (index) {

			var panel = this.panels[index],
				tab = this.tabs[index];

			//
			if(this.running || panel == null) return null;

			this.panels.splice(index, 1);
			panel.dispose();

			if(this.anim.remove) this.anim.remove(panel, index);

			if(tab) {

				tab.removeEvents(this.events);
				this.tabs.splice(index, 1);
			}
			
			if(panel == this.selected) if(this.setSelectedIndex(Math.min(index, this.panels.length - 1)));
			this.current = this.panels.indexOf(this.selected);
			
			if(this.panels.length > 0 && this.current == -1) this.setSelectedIndex(0);

			return {panel: panel, tab: tab}
		},

		next: function () {

			return this.setSelectedIndex((this.getSelectedIndex() + this.panels.length + 1) % this.panels.length, 1);
		},

		previous: function () {

			return this.setSelectedIndex((this.getSelectedIndex() + this.panels.length - 1) % this.panels.length, -1);
		},

		change: function(newPanel, oldPanel, index, oldIndex) {

			var _new = this.tabs[index], _old = this.tabs[oldIndex], options = this.options;

			if(_old) _old.removeClass(options.activeClass).addClass(options.inactiveClass);
			if(_new) _new.removeClass(options.inactiveClass).addClass(options.activeClass);

			this.selected = newPanel;
			this.current = index;

			this.fireEvent('change', Array.slice(arguments))
		},

		complete: function () {

			this.running = false;
			this.fireEvent('complete', [this.selected, this.current]);

			//consider only the last parameters
			if(this.queue.length > 0) this.setSelectedIndex.apply(this, this.queue.pop())
		},
		
		isSupported: function (animation) {
		
			animation = this.prototype.plugins[animation];
			
			if(animation) return animation.isSupported ? animation.isSupported() : true;
			
			return false
		},

		resize: function (panel) {

			if(panel == undefined) panel = this.selected;

			var position = panel.style.position;

			panel.style.position = 'static';
			panel.style.height = '';

			this.container.morph({height: panel.offsetHeight, width: panel.offsetWidth});
			panel.style.position = position;
			return this;
		},

		getSelectedIndex: function() { return this.current },

		setSelectedIndex: function(index, direction) {

			if(this.running) {

				switch(this.options.link) {

					case 'cancel':
								if(this.anim.cancel) this.anim.cancel();
								break;
					case 'chain':
								this.queue = [arguments];
								return this;
					case 'ignore':
								return this;
				}
			}

			var current = this.current,
				curPanel = this.panels[current],
				newPanel = this.panels[index];

			if(!newPanel || this.current == index || this.selected == newPanel || index < 0 || index >= this.panels.length) return this;

			this.running = true;
			this.anim.move(newPanel, curPanel, index, current, direction);

			return this
		},
		
		plugins: {
				
			//default plugin
			None: new Class({

				Implements: Events,

				initialize: function (panels, options) {

					this.addEvents(options);
					panels.each(function (el, index) { el.style.display = index == 0 ? 'block' : 'none' })
				},

				add: function (el) {

					el.style.display = 'none';
					return this
				},

				move: function (newPanel, oldPanel) {

					newPanel.style.display = 'block';
					if(oldPanel) oldPanel.style.display = 'none';
					this.fireEvent('change', Array.slice(arguments)).fireEvent('complete');
				}
			})
		}
	});
	
	context.Tab.isSupported = context.Tab.prototype.isSupported;
		
}(this);


