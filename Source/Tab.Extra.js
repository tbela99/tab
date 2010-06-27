/*
---
script: Tab.Extra.js
license: MIT-style license.
description: Extends Tab with automatic slide.
copyright: Copyright (c) 2008 Thierry Bela
authors: [Thierry Bela]

requires: 
  - Tab
provides: [Tab.Extra]
...
*/

	Tab.Extra = new Class({ 
		
		/*
		
			options: {
			
				interval: 10, //delay between 2 executions in seconds
				reverse: true
			},
			reverse: false, //move direction
		*/
			Extends: Tab,
			Binds: ['update', 'start', 'stop'],
			initialize: function(options) {

				this.parent(options);	
				this.reverse = !!this.options.reverse;
				this.timer = new PeriodicalExecuter(this.update, options.interval || 10);
				
				return this
			},
			
			update: function () { return this[this.reverse ? 'previous' : 'next']() },
			
			start: function () {
			
				return this.timer.registerCallback();
				return this
			},
			
			stop: function() { 
			
				this.timer.stop();
				return this
			}
		});