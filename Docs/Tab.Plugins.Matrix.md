Matrix {#Tabsplugins:Matrix}
============

Apply various effects to the transition, this plugin is designed to work with images.

It should work in every browser **but IE6.**

### Options:

* random  - (*boolean*, optional) apply effects randomly. default to true.
* mode  - (*string*, optional) define the direction of the animation. default to *horizontal*. possible values are *vertical* | *horizontal* | *both*.
* amount - (*int*, optional) number of rows. default to 8
* fragments - (*int*, optional) number of fragments per row. default to 3.
* sort - (*mixed*, optional) the sort filter to apply to the slices. default to *['none', 'reverse', 'shuffle']*.
* transitions  - (*mixed*, optional) list of transitions to use, you can specify one or more transitions. if not specified all transitions will be applied. default to *['grow', 'floom', 'wave', 'lines', 'chains', 'fold', 'fall', 'explode', 'implode', 'out']*

## Example:

	//example 1
	var swapper = new Tab({
						container: 'slide', 
						//setup animation
						animation: 'Matrix', 
						params: {
						
							//we got the Oskar Floom here
							random: false,
							transitions: 'floom',
							duration: 75,
							amount: 24,
							fragments: 1
						},
						fx: {
							duration: 500 //this should be greater than params.duration * params.fragments * params.amount
						}
					});

	//example 2
	var swapper2 = new Tab({
						container: 'slide2', 
						//setup animation
						animation: 'Matrix', 
						params: {
						
							//plugins parameters here
							transitions: ['fold', 'chains']
						},
						fx: {
							duration: 500
						}
					});

