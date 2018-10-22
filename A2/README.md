@title : VIS-A1 README
@author: Robert Ernstbrunner
@matnr.: 01403753
@date  : 12.10.2018

How I visualize the data:

- The coordinates together with the home cities from the original urbana_crimes.csv are
  extracted and transformed with d3.geoMercator.
- The view captures a part of North America centered around Urbana.
- Inconsistent entries are filtered and relevant cities are counted by a city-counter.
- Specific cities are chosen and their geocentric locations, together with other
  attributes, are stored and loaded from a separate CSV file. I had to do this since
  the centers cannot be retrieved from the original data. Also, computing averages
	wasn't accurate enough and would have been too much computational effort.
- Circles around the cities are created with a radius that grows logarithmically with
  the city-counter values.
- Every city is connected to Urbana via a line whose stroke-width also grows
  logarithmically with the city-counter values. Any labels that would cross the lines
  are moved.
- Globe-axes (graticules) are added together with an x and y scale (in miles). I was
  thinking about removing the graticules, after hearing about 'chartjunk', but I decided
  to keep them in the end, since I already put in the effort.
- A map is loaded as background via topoJSON.
- Each city has their own color. A legend is placed in the lower right corner that maps
  cities to their color and indicates the number of arrestees.

Why I visualize the data in that way:

  At first I connected every single coordinate via thin lines to the center of Urbana
  because the exercise description kind of points in that direction. The visualization
	was not satisfying and no useful information could be gained from that. As a
	consequence, I decided to create lines from the cities to Urbana only and visualize
	the 'criminal's march to Urbana' (kinda my own simplified version of Napoleon's march
	to Russia). Another thing that popped into my head was visualizing magnitude in form
	of circles. That's why I created growing circles around the cities.

  One can immediately see, that most arrestees are from Urbana, with Chicago in second
  place, Jacksonville and Washington take third and fourth places. Looking at the
  growing circles, my visualization might be a bit misleading. One has to	think on a
  logarithmic scale, which is generally hard to do. There's a nice story for the inverse
  (exponential) function, namely the Legend of Paal	Paysam, where a king was to put a
  single grain of rice on the first chess square and double it on every consequent one,
  leading to about 210 billion tons of rice in the end, a figure he wasn't expecting at
  all.
  So in my case one might not expect only 21 arrestees from Atlanta compared to the 8539
  from Urbana by just looking at these growing circles.