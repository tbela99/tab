
/*
---
script: Tabs.Plugins.Stack.js
license: MIT-style license.
description: Stack - swap panel using a stack.
copyright: Copyright (c) 2008 Thierry Bela
authors: [Thierry Bela]

requires:
  tab:0.1.4:
  - Tab
provides: [Tab.plugins.Stack]
...
*/

// shamelessly based on mooStack v0.1 by Martino di Filippo
!function (context) {

	context.Tab.prototype.plugins.Stack = new Class({

		options: {

			scattering: 0
		},
		fx: {

			duration: 800,
			link: 'chain'
		},
		stack: [],
		Binds: ['reindex'],
		Implements: [Options, Events],
		initialize: function(panels, options, fx) {

			this.setOptions(options);
			this.fx = Object.merge({}, this.fx, fx);
			this.reindexing = false;
			this.rightEdge = 0;
			this.d = 1;

			this.fx.duration  = (this.fx.duration / 2).toInt();

			this.panels = panels;
			this.current = 0;
			this.selected = panels[0];
			
			this.container = options.container.setStyles({display: 'block', position: 'relative', overflow: 'visible'});
			
			if(this.selected) this.container.setStyles({width: this.selected.getStyle('width'), height: this.selected.getStyle('height') + this.options.scattering});
			
			this.reset();
			this.rightEdge += this.options.scattering;
			this.update()
		},
		
		reset: function() {
		
			var wrapper = new Element('div[style=position:absolute]'),
				z = this.panels.length,
				i = 0,
				height = 0,
				stack = this.stack.concat(),
				length = this.panels.length,
				r;
				
			this.current = this.panels.indexOf(this.selected);
			
			this.stack = this.panels.map(function(el, index) {

				r = this.d * Number.random(0, this.options.scattering);
				this.d = -this.d;

				height = Math.max(height, el.setStyles({display: 'block'}).offsetHeight);
				if(this.rightEdge < el.offsetWidth) this.rightEdge = el.offsetWidth;
				
				return wrapper.clone()
					.set({
						styles: {

							height: el.offsetHeight,
							width: el.offsetWidth,
							zIndex: (--z - this.current + length) % length
						},
						morph: this.fx
					})
					.store('stack:index', index)
					.wraps(el)
					.inject(this.container)
			}, this);
			
			stack.invoke('destroy');
			wrapper.destroy();
			return this
		},
		
		add: function () {
		
			return this.reset()
		},

		remove: function () {
		
			return this.reset()
		},

		move: function () {

			return this.fireEvent('change', arguments).goTo(arguments[2]).fireEvent('complete', this.fx.duration)
		},

		goTo: function(index) {

			//isElement
			if(Type.isElement(index)) index = index.getParent().retrieve('stack:index');

			if(isNaN(index) || this.current == index) return this;

			var forward = this.current < index ? index - this.current : this.stack.length - this.current + index,
				backward = this.current > index ? this.current - index : this.current + this.stack.length - index;
			return this.swapMany((Math.abs(forward) <= Math.abs(backward)) ? forward : -backward);
		},

		reindex: function() {
		
			var z = this.stack.length;
			this.stack.each(function(wrapper){ wrapper.setStyle('z-index', z--) });

			return this
		},

		swap: function(direction) {

			var current = this.stack[0],
				options = this.options,
				next,
				out,
				last,
				elt,
				r = this.d * Number.random(0, options.scattering);

			this.d = -this.d;

			switch(direction) {
				case 'prev':
					next = this.stack.pop();
					this.stack = [next].concat(this.stack);
					break;
				case 'next':
				default:
					direction = 'next';
					next = this.stack[1];
					this.stack.push(current);
					this.stack.shift()
			}

			if(this.reindexing) clearTimeout(this.reindexing);
			this.reindexing = this.reindex.delay(this.fx.duration);

			out = [Number.random((-options.scattering * 2).toInt(), 0), Number.random(this.rightEdge, this.rightEdge + (options.scattering * 2))];
			last = [Number.random(0, options.scattering), Number.random(0, options.scattering)];
			elt = direction == 'next' ? current : next;
			elt.morph({
				marginTop: out[0],
				marginLeft: out[1]
			}).morph({
				marginTop: last[0],
				marginLeft: last[1]
			});

			return this.update()
		},

		swapMany: function(many) {

			var direction = many < 0 ? 'prev' : 'next', time = 0;
			many = Math.abs(many);

			while(many--) {

				this.swap.delay(time + 25, this, direction);
				time += 75
			}

			return this
		},

		update: function() {

			this.current = this.stack[0].retrieve('stack:index');
			this.selected = this.panels[this.current];
			return this
		}
	})
}(this);

