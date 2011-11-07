	
/*
---
script: Tab.Cookie.js
license: MIT-style license.
description: Extends Tab with automatic slide.
copyright: Copyright (c) 2008 Thierry Bela
authors: [Thierry Bela]

requires: 
  tab:0.1.5.1: 
  - Tab
provides: [Tab.Cookie]
...
*/
!function (context) {

"use strict";

	context.Tab.Cookie = new Class({ 
		
		Extends: context.Tab,
		initialize: function(options) {

			options = Object.append({useCookie: true, cookie: 'tab'}, options);
			
			if(options.useCookie) {
			
				var current = parseInt(Cookie.read(options.cookie));
				if(!isNaN(current)) options.current = current
			}
			
			this.addEvent('change', function () { Cookie.write(options.cookie, arguments[2]) }).parent(options)
		}
	})
	
}(this);
