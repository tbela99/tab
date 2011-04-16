/*
---
script: Tab.Extra.js
license: MIT-style license.
description: Extends Tab with automatic slide.
copyright: Copyright (c) 2008 Thierry Bela
authors: [Thierry Bela]

requires:
  tab:0.1.5.1:
  - Tab
provides: [Tab.Extra]
...
*/

	Tab.Extra = new Class({

		/*
			options: {


				interval: 10, //interval between 2 executions in seconds
				delay: 10, //delay between the moment a tab is clicked and the auto slide is restarted
				reverse: true, //move backward
				autostart: true
			},
		*/
			Extends: Tab,
			Binds: ['update', 'start', 'stop'],
			initialize: function(options) {

				this.parent(Object.append({interval: 10, delay: 10, autostart: true}, options));

				//handle click on tab. wait 10 seconds before we go
				this.tabs.each(function (el) {

					el.addEvent('click', function () {

						this.stop().start.delay(this.options.delay * 1000)

					}.bind(this))
				}, this);

				this.timer = new PeriodicalExecuter(this.update, this.options.interval);

				if(!this.options.autostart) this.stop();

				return this
			},

			update: function () { return this[this.options.reverse ? 'previous' : 'next']() },

			start: function () {

				this.timer.registerCallback();
				this.active = true;
				return this
			},

			stop: function() {

				this.timer.stop();
				this.active = false;
				return this
			},
		
			toggle: function() { 
			
				return this[this.active ? 'stop' : 'start']()
			}
		});