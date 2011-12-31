
var removed = 0;

	function parseQueryString (options) {
	
		options = options || {};
				
		var query = decodeURIComponent(location.search),  
			params = query.substring(1).split('&'),
			form = document.forms[0];
		
		if(params && params.length > 0) {
			
			var tb = {};
			
			params.each(function (val) {
			
				val = val.split('=');
				
				if(val[0].test(/\[.*]$/)) {
				
					tb[val[0]] = tb[val[0]] || [];
					tb[val[0]].push(val[1])
				} else tb[val[0]] = val[1]
			});
			
			Object.each(tb, function (val, key) {
		
				var el = form[key];
				
				if(el) {
				
					if(el.length) {
					
						//select
						if($(el)) {
							
							Array.from(el.options).each(function (option, index) {
							
								if(option.value == val) el.selectedIndex = index
							});
								
							options[key] = val
						}
						//radio - checkbox
						else {
						
							val = Array.from(val);
							Array.from(el).each(function (c) {
							
								for(var i = val.length - 1; i >= 0; i--)
									if(c.value == val[i]) {
									
										if(el.length > 1 && el[0].type == 'checkbox') {
											
											options[key.replace('[]', '')] = val
										}
										else options[key.replace('[]', '')] = val[i];
										c.checked = true
									}
							})
						}
						
					}
					else {
					
						if($(el).get('tag') == 'select') Array.from(el.options).each(function (option, index) {
						
							if(option.value == val) el.selectedIndex = index
						});
						else $(el).set('value', val);
						//if($(el).get('tag') == 'select') Array.from(el.options)
						if(key == 'duration') duration = val;
						else options[key] = val
					}
				}
			});
			
			//needed
			if(options.random && options.random.toInt) options.random = options.random.toInt();
		}
		
		return options
	}
			
	function change() {
	
		var panel = this.retrieve('panel');
		
		if(this.checked) {
			
			if(!panel) {
			
				if(tab.running) {
				
					tab.addEvent('complete:once', change.bind(this));
					return
				}
				
				panel = tab.remove(Math.max(0, this.value - removed));
				
				if(panel) {
				
					//remove the associated link
					panel.tab.dispose().removeClass('selected');
					this.store('panel', panel);
					removed++;
				}
				
				this.checked = !!panel
			}
			
		} else {
		
			if(panel) {
			
				this.eliminate('panel');
				removed--;
				tab.add(panel.panel, panel.tab.inject(document.getElement('.tabs')), this.value)
			}
		}
	}
		
$$('input.remove').addEvents({click: change, change: change})		