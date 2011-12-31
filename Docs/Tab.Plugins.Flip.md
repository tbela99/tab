Move {#Tabs-plugins:Flip}
============

flip panels either vertically or horizontally.

### Options: {#Tabs-plugins:options}

* mode  - (*string*, optional) define the direction of the panels movement. default to *horizontal*. possible values are *vertical* | *horizontal*.

## Example:

	
	var swapper = new Tab({
						container: 'slide', 
						//is animation supported ?
						animation: Tab.isSupported('Flip') ? 'Flip' : 'Move',
						onChange: function () {

							if(window.console && console.log) console.log(arguments)
						}, 
						params: {
						
							mode: 'vertical'
						},
						fx: {
							duration: 800
						}
					});

