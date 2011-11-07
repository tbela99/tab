Tab.Extra {#Tab-extra}
============

Extends Tab by adding autoslide capabilities.

Tab.Extra Method: constructor {#Class:constructor}
---------------------

### Syntax:

	var swapper = new Tab.Extra(options);


### Arguments:

1. options - (*object*) See below.

Tab.Extra supports every Tab options plus specific parameters for the autoslide control:

### Options: {#Tab-extra-options}

* autostart - (*boolean*, optional). start automatic slide. default to true.
* interval - (*int*, optional). interval between 2 executions in seconds. default to 10.
* delay - (*int*, optional). when a tab is clicked, the autoslide is stopped. this defines the delay before the autoslide is restarted. default to 10.


Tab.Extra Method: start {#Tab-extra-start}
----------------------------

starts autoslide.

### Returns:

* (*object*) - This Tab.Extra instance.

Tab Method: stop {#Tab-extra-stop}
----------------------------

stop autoslide.

### Returns:

* (*object*) - This Tab.Extra instance.

Tab Method: toggle {#Tab-extra-toggle}
----------------------------

toggle automatic slide.

### Returns:

* (*object*) - This Tab.Extra instance.