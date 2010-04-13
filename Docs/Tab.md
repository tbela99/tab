Tab {#Tab}
============

Minimalistic but extensible tab swapper. It can be used to create a tab swapper as well as a galerie slideshow. The swapping can be customized by specifying a plugin in the constructor.

Tab Method: constructor {#Class:constructor}
---------------------

### Syntax:

	var swapper = new Tab(options);


### Arguments:

1. options - (*object*) See below.

### Options: {#Tab:options}

* current  - (*int*, optional) index of the panel that is displayed first.
* container  - (*mixed*) the element that contains the panels.
* selector  - (*string*, optional) only container children that match the selector will be grabbed.
* tabs  - (*mixed*, optional) the tabs. this is anything you can pass to $$. when a tab is clicked, the corresponding panel is shown.
* activeClass  - (*string*, optional) style applied to the selected tab.
* inactiveClass  - (*string*, optional) style applied to evry unselected tab.
* animation  - (*string*, optional) the transition plugin to use for swapping. default to *None*
* params - (*object*, optional) parameters for the transition plugin.
* fx - (*object*, optional) parameters for the animation. this can be any of the Fx parameters.


### Events:

#### create

Fired right after the tabs has been created.

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


Tab Method: next {#Tab:next}
----------------------------

display the next panel.

### Returns:

* (*object*) - This Tab instance.

Tab Method: previous {#Tab:previous}
----------------------------

display the previous panel.

### Returns:

* (*object*) - This Tab instance.

Tab Method: getSelectedIndex {#Tab:getSelectedIndex}
----------------------------

### Returns:

* (*int*) - the index of the displayed panel

Tab Method: setSelectedIndex {#Tab:setSelectedIndex}
----------------------------

set the displayed panel.

### Syntax:

	swapper.setSelectedIndex(0);

### Arguments:

- index - (*int*) index of the panel to display.

### Returns:

* (*object*) - This Tab instance.