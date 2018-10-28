@title : VIS-A2 README
@author: Robert Ernstbrunner
@matnr.: 01403753
@date  : 28.10.2018



How I visualize the data:

- Mouseover/click&band selection:
	City centers are now represented by red circles which inflate on mouseover.
	Clicking on a city will pin it down and the path to Urbana (for any city != Urbana) and 
	cityname will be shown.
	On mouseover, a pinned city will yield a tooltip that explains how to unpin a single city
	or multiple cities at once. Since the tooltip does such a good job, I will refrain from
	explaining this here and just mention that I implemented some kind of 2D 'band-UNselection'
	here (the implementation does not simplify for unselecting cities, I just wanted to explore 
	my dyslexic side).

- Additional table:
	When a city is selected, a word and a number pop up on the right table with the stapler.
	The word is a synonym for the selected city, and the number is the total ammount of crimes 
	commited over the entire time period. This is where the enter/update/delete pattern comes
	into play.
	Just in case you're wondering about the stapler, it's an hommage to the film 'Office Space'. 

- Popup histogram:
	When selecting a city, most certainly a histogram will pop up. It will indicate the age of
	the	criminals for the selected year, if and only if there was a crime from a citicen in that
	specific year. Otherwise there will be no popup.
	If multiple cities are selected, the histogram shows the accumulated data	for all	selected
	cities in a specific year. The popup also incorporates draging and closing-on-demand
	mechanisms but is strictly redrawn after every change (which simplifies things for now).

- Scrubber for selecting the year:
	The scrubber is located on the right table under my shiny red stapler. I chose a range
	spanning ten years to select from. A selection will trigger the histogram popup to change
	its	content.



Why I visualize the data in that way:
	I chose to select only 8 cities (nominal data) so I could have a nice color set. Also, the
	implementation is faster the more stuff is filtered beforehand. In general I tried to stick
	to conventions learned in class

	
- Sources:
	The code for the band selection was inspired by http://bl.ocks.org/lgersman/5311083
	The code for the slider was inspired by https://bl.ocks.org/johnwalley/e1d256b81e51da68f7feb632a53c3518
	The code for the histogram was inspired by https://bl.ocks.org/d3noob/96b74d0bd6d11427dd797892551a103c