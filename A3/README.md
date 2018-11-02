@title : VIS-A3 README
@author: Robert Ernstbrunner
@matnr.: 01403753
@date  : ..2018



How I visualize the data:

- Mouseover/click&band selection:
	City centers are now represented by red circles which inflate on mouseover.
	Clicking on a city will pin it down and the path to Urbana (for any city != Urbana) and 


Why I visualize the data in that way:

-	I chose to select only 8 cities (nominal data) so I could have a nice color set (I didn't
	use a color-brewer and I didn't check for color-blindness though). Also the implementation
	is faster if more stuff is filtered beforehand. I use a preprocessed CSV file for my
	application now. I did this in order to speed up the loading process at the beginning. The
	code for filtering and writing to CSV is comented out and appended to the 'vis.js' file.
	Just in case you're wondering about the stapler and word encoding for cities on the right
	table: it's an hommage to a movie that was mentioned in class. Also, it would have been
	nice to draw a stacked multi-colored histogram for when multiple cities are selected, but 
	I ran out of time and integer-stored money.



Sources:
	
- The code for the band selection was inspired by
	http://bl.ocks.org/lgersman/5311083
	and
	https://bl.ocks.org/romsson/568e166d702b4a464347
	.
-	The code for the slider was inspired by
	https://bl.ocks.org/shashank2104/d7051d80e43098bf9a48e9b6d3e10e73
	.
-	The code for the histogram was inspired by
	https://bl.ocks.org/d3noob/96b74d0bd6d11427dd797892551a103c
	.
-	(all pages last visited 28.10.2018)
