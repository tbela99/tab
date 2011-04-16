/*
---
description: native css animations with morph and tween, support of the css3 transform rule.

license: MIT-style

authors:
- Thierry Bela

credits:
- Pat Cullen (Fx.CSS.Transform)
- André Fiedler, eskimoblood (Fx.Tween.CSS3)

requires:
core/1.3:
- Array
- Class/Class
- Element/Element.Style
- Fx/Fx.CSS

provides: [Fx.CSS.Parsers.Transform]

...
*/

(function () {

	var set = Element.prototype.setStyle,
		get = Element.prototype.getStyle,
		vendor = '',
		div = new Element('div'),
		css3Transition,
		transitionTimings = {
		'linear'		: '0,0,1,1',
		'expo:in'		: '0.71,0.01,0.83,0',
		'expo:out'		: '0.14,1,0.32,0.99',
		'expo:in:out'	: '0.85,0,0.15,1',
		'circ:in'		: '0.34,0,0.96,0.23',
		'circ:out'		: '0,0.5,0.37,0.98',
		'circ:in:out'	: '0.88,0.1,0.12,0.9',
		'sine:in'		: '0.22,0.04,0.36,0',
		'sine:out'		: '0.04,0,0.5,1',
		'sine:in:out'	: '0.37,0.01,0.63,1',
		'quad:in'		: '0.14,0.01,0.49,0',
		'quad:out'		: '0.01,0,0.43,1',
		'quad:in:out'	: '0.47,0.04,0.53,0.96',
		'cubic:in'		: '0.35,0,0.65,0',
		'cubic:out'		: '0.09,0.25,0.24,1',
		'cubic:in:out'	: '0.66,0,0.34,1',
		'quart:in'		: '0.69,0,0.76,0.17',
		'quart:out'		: '0.26,0.96,0.44,1',
		'quart:in:out'	: '0.76,0,0.24,1',
		'quint:in'		: '0.64,0,0.78,0',
		'quint:out'		: '0.22,1,0.35,1',
		'quint:in:out'	: '0.9,0,0.1,1'
	},
	prefix = (Browser.safari || Browser.chrome || Browser.Platform.ios) ? 'webkit' :
			(Browser.opera) ? 'o' :
			(Browser.ie) ? 'ms' : '';

	//sounds like this is dirty, real dirty
	switch(Browser.name) {

		case 'safari':
		case 'chrome':
		case 'safari':
			vendor = '-webkit-';
			break;
		case 'firefox':
			vendor = '-moz-';
			break;
		case 'opera':
			vendor = '-o-';
			break;
		case 'ie':
			vendor = '-ms-';
			break;
	}

	Element.implement({

		setStyle: function (property, value) {

			switch(property) {

				case 'transform':
				case 'transition':
							property = vendor + property;
							break;
			}

			return set.call(this, property, value);
		},
		getStyle: function (property) {

			switch(property) {

				case 'transform':
				case 'transition':
							property = vendor + property;
							break;
			}

			return get.call(this, property);
		}
	});

	css3Transition = !!div.setStyle('transition', 'none').getStyle('transition');
	
	//eventTypes
	['transitionStart', 'transitionEnd', 'animationStart', 'animationIteration', 'animationEnd'].each(function(eventType){

			Element.NativeEvents[eventType.toLowerCase()] = 2;

			var customType = eventType;

			if (prefix) customType = prefix + customType.capitalize();
			else customType = customType.toLowerCase();

			Element.NativeEvents[customType] = 2;

			Element.Events[eventType.toLowerCase()] = {base: customType }

	}, this);

	Number.implement({
		toRad: function() { return this * Math.PI/180; },
		toDeg: function() { return this * 180/Math.PI; }
	});

	Fx.CSS.implement({

		compute: function(from, to, delta) {

			var computed = [];

			from = Array.from(from);
			to = Array.from(to);
			(Math.min(from.length, to.length)).times(function(i){

				computed.push({value: from[i].parser.compute(from[i].value, to[i].value, delta), parser: from[i].parser});
			});
			computed.$family = Function.from('fx:css:value');
			return computed;
		},

		prepare: function(element, property, values) {

			values = Array.from(values);

			if (values[1] == null){

				values[1] = values[0];
				values[0] = element.getStyle(property);
			}

			var parser, parsed;

			if(property == 'transform') {

				parser = Fx.CSS.Parsers.Transform;
				parsed = values.map(function (value) { return {value: parser.parse(value), parser: parser} })
			}

			else parsed = values.map(this.parse);

			return {from: parsed[0], to: parsed[1]};
		}
	});

	var FxCSS = {

		Binds: ['onComplete'],
		initialize: function(element, options){

			this.element = this.subject = document.id(element);
			this.parent(Object.merge({transition: 'sine:in:out'}, options));
			this.events = {transitionend: this.onComplete}
		},

		check: function(){

			if (this.css) {

				if(!this.locked && !this.running) return true
			}

			else if (!this.timer) return true;

			switch (this.options.link) {

				case 'cancel': this.cancel(); return true;
				case 'chain': this.chain(this.caller.pass(arguments, this)); return false;
			}

			return false;
		},

		onComplete: function () {

			if(this.css && this.running) {

				this.element.removeEvents(this.events).setStyle('transition', 'none');
				this.running = false
			}
			
			this.css = false;
			this.locked = false;
			
			return this.parent()
		},

		cancel: function() {

			if (this.css && this.running) {
			
				this.running = false;
				this.css = false
			}
			
			return this.parent()
		}
	};

	Fx.Tween.implement(Object.merge({

		start: function(property, from, to) {

			var args = Array.flatten(arguments), parsed;

			property = this.options.property || args.shift();

			if (!this.check(property, from, to)) return this;

			//console.log(
			this.css = !this.locked && typeof this.options.transition == 'string' && css3Transition && transitionTimings[this.options.transition]
						&& property != 'transform';

			this.property = property;

			parsed = this.prepare(this.element, property, args);

			if (this.css) {

				this.running = true;
				to = Array.flatten(Array.from(parsed.to))[0];
				from = Array.flatten(Array.from(parsed.from))[0];

				from = from.parser.serve(from.value);
				to = to.parser.serve(to.value);

				if(args[1]) this.element.setStyle('transition', 'none').setStyle(property, from);

				this.element.addEvents(this.events).setStyle('transition', property + ' ' + this.options.duration + 'ms cubic-bezier(' + transitionTimings[this.options.transition] + ')').
							setStyle(property, to);
				
				//console.log([to, from, ['', 'transparent', 'auto', 'none'].indexOf(from)])
				if(from == to || ['', 'transparent', 'auto', 'none'].indexOf(from) != -1) this.onComplete();

				return this
			}

			//chaining css animation && timer leads to unpredictable animation order
			this.locked = true;

			return this.parent(parsed.from, parsed.to);
		}
		
	}, FxCSS));

	Fx.Morph.implement(Object.merge({

		start: function(properties) {

			if (!this.check(properties)) return this;
			
			this.css = !this.locked && typeof this.options.transition == 'string' && css3Transition && transitionTimings[this.options.transition]
						&& !properties.transform;

			if (typeof properties == 'string') properties = this.search(properties);
			var from = {}, to = {};
			for (var p in properties){
				var parsed = this.prepare(this.element, p, properties[p]);
				from[p] = parsed.from;
				to[p] = parsed.to;
			}

			if(this.css) {

				this.running = true;
				this.element.setStyle('transition', 'none');

				Object.each(from, function (value, property) {

					value = Array.flatten(Array.from(value))[0];
					this.element.setStyle(property, value.parser.serve(value.value))

				}, this);
				
				this.element.addEvents(this.events).setStyle('transition', 'all ' + this.options.duration + 'ms cubic-bezier(' + transitionTimings[this.options.transition] + ')');

				Object.each(to, function (value, property) {

					value = Array.flatten(Array.from(value))[0];
					this.element.setStyle(property, value.parser.serve(value.value))
				}, this);
				
				return this
			}
		
			//chaining css animation && timer leads to unpredictable animation order
			this.locked = true;
			return this.parent(from, to);
		}
	}, FxCSS));
/* 
	Fx.Elements.implement(Object.merge(FxCSS, {
	
		initialize: function(elements, options){
		
			this.elements = this.subject = $$(elements);
			this.parent(Object.merge({transition: 'sine:in:out'}, options));
			this.events = {transitionend: this.onComplete}
		},

		start: function(obj){
		
			this.css = !this.locked && typeof this.options.transition == 'string' && css3Transition && transitionTimings[this.options.transition];
					//	&& !properties.transform;

			var from = {}, to = {};
			
			for (var i in obj){
			
				var iProps = obj[i], iFrom = from[i] = {}, iTo = to[i] = {};
				
				for (var p in iProps){
				
					if(p == 'transform' && this.css) this.css = false;
					var parsed = this.prepare(this.elements[i], p, iProps[p]);
					iFrom[p] = parsed.from;
					iTo[p] = parsed.to;
				}
			}
			
			if (!this.check(obj)) return this;
			
			if(this.css) {
		
				this.running = true;
				this.completed = 0;
				
				for(i in from) {
				
					this.elements[i].setStyle('transition', 'none');

					Object.each(from[i], function (value, property) {

						value = Array.flatten(Array.from(value))[0];
						
						this.elements[i].setStyle(property, value.parser.serve(value.value))

					}, this);
					
					this.elements[i].addEvents(this.events).setStyle('transition', 'all ' + this.options.duration + 'ms cubic-bezier(' + transitionTimings[this.options.transition] + ')');

					Object.each(to[i], function (value, property) {

						value = Array.flatten(Array.from(value))[0];
						this.elements[i].setStyle(property, value.parser.serve(value.value))
					}, this);
				
				}
				
				return this
			}
			
			this.locked = true;
			
			return this.parent(from, to);
		},


		onComplete: function () {

			if(this.css && this.running) {

				this.completed++;
				
				console.log(this.completed);
				
				if(this.completed < this.elements.length) return this;
				
				//console.log('completed: ' + this.completed);
				
				this.elements.each(function (el) { el.removeEvents(this.events).setStyle('transition', 'none') }, this);
				this.running = false
			}
			
			this.css = false;
			this.locked = false;
			return this.parent()
		}
	}));
	 */
var deg = ['skew', 'rotate'],
	px = ['translate'],
	generics = ['scale'],
	coordinates = ['X', 'Y', 'Z'];

	px = px.concat(coordinates.map(function (side) { return px[0] + side }));
	generics = generics.concat(coordinates.map(function (side) { return generics[0] + side }));
	deg = deg.concat(coordinates.map(function (side) { return deg[0] + side })).concat(coordinates.map(function (side) { return deg[1] + side }));

	Object.merge(Fx.CSS.Parsers, {

		Transform: {

			parse: function(value){

				var transform = {};

				if(px.every(function (t) {

					if((match = value.match(new RegExp(t + '\\(\\s*([-+]?([0-9]*\\.)?[0-9]+)(px)?\\s*(,\\s*([-+]?([0-9]*\\.)?[0-9]+)(px)?\\s*)?\\)', 'i')))) {

						var x = parseFloat(match[1]),
							y = parseFloat(match[5]);

						//allow optional unit for 0
						if(!match[3] && x != 0) return false;

						if(match[4]) {

							if(!match[7] && y != 0) return false;
							transform[t] = [x, y]
						}

						else transform[t] = x
					}

					return true
				}) && deg.every(function (t) {

					if((match = value.match(new RegExp(t + '\\(\\s*([-+]?([0-9]*\\.)?[0-9]+)(deg|rad)?\\s*(,\\s*([-+]?([0-9]*\\.)?[0-9]+)(deg|rad)?)?\\s*\\)', 'i')))) {

						var x = parseFloat(match[1]),
							y = parseFloat(match[5]);

						//allow optional unit for 0
						if(!match[3] && x != 0) return false;
						if(match[4]) {

							if(!match[7] && y != 0) return false;
							transform[t] = [match[3] == 'rad' ? parseFloat(match[1]).toDeg() : parseFloat(match[1]), match[7] == 'rad' ? parseFloat(match[5]).toDeg() : parseFloat(match[5])]
						}

						else transform[t] = match[3] == 'rad' ? parseFloat(match[1]).toDeg() : parseFloat(match[1])
					}

					return true
				}) && generics.every(function (t) {

					if((match = value.match(new RegExp(t + '\\(\\s*(([0-9]*\\.)?[0-9]+)\\s*(,\\s*(([0-9]*\\.)?[0-9]+)\\s*)?\\)', 'i')))) {

						if(match[3]) transform[t] = [parseFloat(match[1]), parseFloat(match[4])];

						else transform[t] = parseFloat(match[1])
					}

					return true

				})) return Object.keys(transform).length == 0 ? false : transform;

				return false
			},
			compute: function(from, to, delta){

				var computed = {};

				Object.each(to, function (value, key) {

					if(value instanceof Array) {

						computed[key] = Array.from(from[key] == null ? value : Array.from(from[key])).map(function (val, index) {

							return Fx.compute(val == null ? value[index] : val, value[index], delta)
						})
					}

					else computed[key] = Fx.compute(from[key] == null ? value : from[key], value, delta)
				});

				return computed
			},
			serve: function(transform){

				var style = '';

				deg.each(function (t) {

					if(transform[t] != null) {

						if(transform[t] instanceof Array) style +=  t + '(' + transform[t].map(function (val) { return val + 'deg' }) + ') ';
						else style += t + '(' + transform[t] + 'deg) '
					}
				});

				px.each(function (t) { if(transform[t] != null) style += t + '(' + Array.from(transform[t]).map(function (value) { return value + 'px' }) + ') ' });
				generics.each(function (t) { if(transform[t] != null) style += t + '(' + transform[t] + ') ' });

				return style
			}
		}
	})
})();
