@title : VIS-A3 README
@author: Robert Ernstbrunner
@matnr.: 01403753
@date  : 11.11.2018


How I visualize the data:

- Plots and multiple layouts:
	
	In total there are two histograms, one scatterplot and an additional (a bit un-
	necessary) barplot.
	
	The first histogram which I will refer to in this readme as 'H_a' is located in the
	top window to the right of the 'map' window (or right below the map window, depending
	on the browser zoom / the browser window size).
	
	The second histogram, which I will denote 'H_p', will pop up in a window when a city
	on the map is selected resp. multiple cities on the map are band selected at once.
	
	The scatterplot is located in the right lower window (or right below the view that 
	holds H_a, depending on the browser zoom / the browser window size).
	
	The additional bar plot will inflate in the top right corner on the map when a city
	is / cities are selected on the map.
	
	
	
- Click filtering and brush filtering:
	
	H_a shows the age (x-axis) vs. overall crimes commited (y-axis) for all cities and
	all years. There is a 1D brush filter below that will focus the view of the selected
	range.
	
	H_p shows the age (x-axis) vs. crimes commited (y-axis) only for a specific year and
	only for the selected cities on the map. The year can be selected in the popup on
	the slider below the histogram. Due to limitations in the slider-length, only the
	last 20 years are available on the slider.
	
	The scatterplot shows time vs. distance, but only for the currently selected year and
	also includes a 1D brush filter.
	
	The addtional barplot responds to the selected cities (x-axis) on the map and shows
	the total number of overall commited crimes (log scale on y-axis). 
	
	
	
- Adjusting the axes and additional datasets:

	There are two x-axes per brush filter. One that shows the total range (for H_a
	a complete year and for the scatterplot ages 5 to 95) and one that will
	adjust itself to the selected range. The y-axes of both filters adjust themselves
	to the maximum values. Therefore, the y-axis on the scatterplot will adjust its
	range for the selected year from the popup-slider and the y-axis on H_a will stay
	unchanged since it shows the total number of crimes for all years.
	
	H_p has a fixed x-axis with the same total age range as H_a but will adjust its
	y-axis based on the selected city/cities and selected year.
	
	The additional barplot adjusts both x- and y-axes based on the selected city/cities.
	
	I use addtional datasets for the exact city-centers and for the topojson map. Also
	I no longer incorporate the original dataset as I have written a data-file generator
	that will preprocess (i.e. filter and transform) the data for better performance.
	The generated file is named 'urbana_reduced.csv' and the generator can be tested by
	executing 'converter.html'. This file depends on the 'converter.js' script and takes
	the original 'urbana.csv' file as input (which I did not include in my submission).
	
	
	
- Showing unfiltered and filtered data simultaneously and responsive design:

	The brush filters both show the complete bars/points above the 'total range' x-axis
	and only the selected points/bars above the 'dynamic' x-axes. In addtion, H_a shows
	bars for all years while H_p filters data for a specific year.
	
	I have a bit of a responsive design when zooming in/out in the browser or when
	adjusting the browser window size respectively. The right views with H_a and the
	scatterplot will be located to the right of the map if they fit into the window
	completely and will be moved below the map otherwise. I did not care for responsive
	design inside the views.

	
Why I visualize the data in that way:

-	I admit that using my visualisation is a bit quirky. I didn't want to throw away
	stuff from A2 (like the moveable popup) and also I was wondering about the
	'bargraph histogram' in the A3 description since there is either one or the other
	(a bargraph or a histogram) and decided to just stick with a simple barplot (the
	additional, unnecessary barplot) at first before realizing after reviewing the forum
	on moodle that a histogram should be used either way. So I implemented H_a right
	afterwards.
	
	Also, I changed the band selection from A2 a bit. Now all band-selected cities will
	be pinned / unpinned depending on their previous pin-status.
	
	++ I use my own distance format called 'CMP' (Cartesian map distance) on the
	scatterplot because we were allowed to just use Cartesian coordinates according to
	the moodle forum.



Sources:
	
- The code for H_a was inspired by
	https://bl.ocks.org/SevenChan07/495cd567e0ede0deeb14bb3599dce685
	.
-	The code for the scatterplot was inspired by
	ex. 3.2 from the VIS tutorial.
	.
-	(all pages last visited 11.11.2018)