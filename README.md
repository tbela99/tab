Tab
============

Minimalistic but extensible tab swapper. It can be used to create a tab swapper as well as a galerie slideshow. 
you can have effects like **Moostack**, the [barack slideshow](https://devthought.com/wp-content/moogets/BarackSlideshow/demo.html) or [jQuery nivoslider](https://nivo.dev7studios.com/) or whatever you want by providing an animation plugin. 
![Screenshot](https://github.com/tbela99/tab/raw/master/thumbnail.jpg)
[Demo](http://tbela99.github.io/tab/Demos/matrix.html)

#### More demos

- [Matrix](http://tbela99.github.io/tab/Demos/matrix.html)
- [Flip 3D](http://tbela99.github.io/tab/Demos/flip.html)
- [Cube 3D](http://tbela99.github.io/tab/Demos/cube.html)
- [Random](http://tbela99.github.io/tab/Demos/random.html?transitions[]=slideOut&directions[]=left&directions[]=right&mode=horizontal&random=0&duration=800)
- [Move](http://tbela99.github.io/tab/Demos/move.html)
- [Stack](http://tbela99.github.io/tab/Demos/stack.html)
- [No animation](http://tbela99.github.io/tab/Demos/none.html)

How to use
---------------------

It is quite simple to use. what you need first is 

### HTML:

	<div id="slide">
    <div class="ctab"><img src="images/slide1.jpg" width="400" height="300" /></div>
        <div class="ctab hidden"><img src="images/slide2.jpg" width="400" height="300" /></div>
        <div class="ctab hidden"><img src="images/slide3.jpg" width="400" height="300" /></div>
        <div class="ctab hidden"><img src="images/slide4.jpg" width="400" height="300" /></div>
  	  </div>
	  
	//the tabs
	 <div class="tabs"><a href="#0">1</a><a href="#1">2</a><a href="#2">3</a><a href="#3">4</a></div>
	 
### Javascript:

	var swapper = new Tab({
	
		container: 'slide',
		tabs: 'div.tabs a',
		onChange: function () {
		
			//do something
		}
	});


### Options:

* container  - (*mixed*) the element that contains the panels.
* selector  - (*string*, optional) only container children that match the selector will be grabbed.
* animation  - (*string*, optional) the transition plugin to use for swapping. default to *None*
* params - (*object*, optional) parameters specific to the transition plugin.
* fx - (*object*, optional) parameters for the animation. this can be any of the Fx parameters.
* current  - (*int*, optional) index of the panel that is displayed first. default to 0
* tabs  - (*mixed*, optional) when a tab is clicked, the corresponding panel is shown. anything you can pass to $$ is accepted. 
* activeClass  - (*string*, optional) style applied to the selected tab.
* inactiveClass  - (*string*, optional) style applied to every unselected tab.
* link - (*string*) control the way concurrent changes are handled. accepted values are *chain* (default), *ignore*, *cancel*

### Events:

#### create

Fired right after the tabs has been setup.

##### Signature:

	onCreate(newPanel, index)

##### Arguments:

1. newPanel - (*element*) the active panel.
2. index - (*int*) the index of the active panel.

#### change

Fired when the active panel is changed.

##### Signature:

	onChange(newPanel, curPanel, index, current)

##### Arguments:

1. newPanel - (*element*) the active panel.
2. oldPanel - (*element*) the previously selected panel.
3. index - (*int*) the index of the active panel.
4. current - (*int*) index of the previously selected panel.


Method: next 
------------

display the next panel.

### Returns:

* (*object*) - This Tab instance.

Method: previous
----------------

display the previous panel.

### Returns:

* (*object*) - This Tab instance.

Tab Method: add {#Tab:add}
----------------------------

add a new panel to the tab.

### Arguments:

- panel - (*mixed*) the new panel.
- tab - (*mixed*, optional) tab associated to the new panel
- index - (*int*, optional) position where the new panel is injected, if not specified, the new panel will be inserted at the end

### Returns:

* (*object*) - This Tab instance.

Tab Method: remove {#Tab:remove}
----------------------------

remove the panel at the given index.

### Arguments:

- index - (*int*)

### Returns:

* (*object*) - an object {panel: panel, tab: tab} containing the panel and the associated tab.

Tab Method: resize {#Tab:resize}
----------------------------

resize the container to fit the panel offset. this is useful if you change the panel content.

### Arguments:

- index - (*int*, optional) index of the panel. if not specified, the current panel is used.

### Returns:

* (*object*) - an object {panel: panel, tab: tab} containing the panel and the associated tab.

Method: getSelectedIndex
------------------------

### Returns:

* (*int*) - the index of the displayed panel

Method: setSelectedIndex
------------------------

set the displayed panel.

### Syntax:

	swapper.setSelectedIndex(0);

### Arguments:

- index - (*int*) index of the panel to display.
- direction - (*int*) indicate in which direction panels should be rotated. accepted values are -1 (right to left) and 1 (left to right).

### Returns:

* (*object*) - This Tab instance.

Method: isSupported
------------------------

return true if the given transition is supported by the browser.

### Syntax:

	swapper.isSupported('Flip');

### Arguments:

- transition - (*string*) transition name.

### Returns:

* (*boolean*) 
