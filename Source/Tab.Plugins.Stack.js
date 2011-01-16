
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

	Tab.prototype.plugins.Stack = new Class({

		options: {

			scattering: 0
		},
		fx: {

			duration: 800,
			link: 'chain'
		},
		Binds: ['reindex'],
		Implements: [Options, Events],
		initialize: function(panels, options, fx) {

			this.setOptions(options);
			this.fx = Object.merge({}, this.fx, fx);
			this.current = 0;
			this.reindexing = false;
			this.rightEdge = 0;
			this.d = 1;

			this.fx.duration  = (this.fx.duration / 2).toInt();

			var wrapper = new Element('div', {
				styles: {
					position: 'absolute'
				}
			}),
			height = 0,
			r,
			z = panels.length;
			
			this.panels = panels;

			this.stack = panels.map(function(el, index) {

				r = this.d * Number.random(0, this.options.scattering);
				this.d = -this.d;

				height = Math.max(height, el.setStyles({display: 'block'}).offsetHeight);

				if(this.rightEdge < el.offsetWidth) this.rightEdge = el.offsetWidth

				return wrapper.clone()
					.set({
						styles: {

							height: el.offsetHeight,
							width: el.offsetWidth,
							zIndex: z--
						},
						morph: this.fx
					}).
					store('stack:index', index)
					.wraps(el)
			}, this);

			this.container = this.stack[0].getParent().setStyles({width: this.stack[0].getStyle('width'), position: 'relative', overflow: 'visible'});

			this.container.tween('height', height + this.options.scattering);

			wrapper.destroy();

			this.rightEdge += this.options.scattering;

			this.update();
		},

		move: function () {

			return this.goTo(arguments[2]).fireEvent('change', arguments).fireEvent('complete')
		},

		goTo: function(index) {

			if(typeOf(index) == 'element') index = index.getParent().retrieve('stack:index');

			if(typeOf(index) != 'number' || this.current == index) return this;

			var forward = this.current < index ? index - this.current : this.stack.length - this.current + index,
				backward = this.current > index ? this.current - index : this.current + this.stack.length - index;
			return this.swapMany((Math.abs(forward) <= Math.abs(backward)) ? forward : -backward);
		},

		reindex: function() {
			var z = this.stack.length;
			this.stack.each(function(wrapper){

				wrapper.setStyle('z-index', z--)
			});

			return this;
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
					next = this.stack.getLast();
					this.stack = [next].extend(this.stack.erase(next));
					break;
				case 'next':
				default:
					direction = 'next';
					next = this.stack[1];
					this.stack.erase(current).push(current);
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
			return this
		}
	});
