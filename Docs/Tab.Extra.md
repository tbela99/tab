Tab.Extra {#Tab-extra}
============

Extends Tab by adding autoslide capabilities.

Tab.Extra Method: constructor {#Class:constructor}
---------------------

### Syntax:

	var swapper = new Tab.Extra(options);


### Arguments:

1. options - (*object*) See below.

Tab.Extra supports every Tab options. it also have specific options that control autoslide:

### Options: {#Tab-extra-options}

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