var cityNum = 8;

var city_counter = new Array(cityNum).fill(0);
var pinned = new Array(cityNum).fill(false);
var context = [];

var svgHeight = 700;
var svgWidth = 950;

var cities;
// var legend;

var svg = d3.select('body')
    .append('svg')
    .attr('height', svgHeight)
    .attr('width', svgWidth)
    .attr('style', 'outline: thin solid black;');

var projection = d3.geoMercator()
    .scale(1300)
    .translate([svgWidth / .410, svgHeight / .56]);

var path = d3.geoPath()
    .projection(projection);

var graticule = d3.geoGraticule();

svg.append('path')
    .datum(graticule)
    .attr('class', 'graticule')
    .attr('d', path);




// load background map
d3.json('50m.json', function (d) {

    svg.insert('path', '.graticule')
        .datum(topojson.feature(d, d.objects.land))
        .attr('class', 'land')
        .attr('d', path);

    svg.insert('path', '.graticule')
        .datum(topojson.mesh(d, d.objects.countries, function (a, b) {
            return a !== b;
        }))
        .attr('class', 'boundary')
        .attr('d', path);

    // add axes
    var earthRadius = 3959;

    var xdist = d3.geoDistance(projection.invert([50, 0]), projection.invert([svgWidth, 0])) * earthRadius;
    var ydist = d3.geoDistance(projection.invert([0, 50]), projection.invert([0, svgHeight])) * earthRadius;

    var x_scale = d3.scaleLinear()
        .range([50, svgWidth])
        .domain([0, xdist]);

    var y_scale = d3.scaleLinear()
        .range([svgHeight, 50])
        .domain([0, ydist]);

    svg.append('g')
        .attr('transform', 'translate(0,' + 650 + ')')
        .call(d3.axisBottom(x_scale));

    svg.append('g')
        .attr('transform', 'translate(' + 50 + ',' + -50 + ')')
        .call(d3.axisLeft(y_scale));

    svg.append('text')
        .attr('x', 62)
        .attr('y', 670)
        .text('(miles)', 'sans-serif');
});

d3.text('urbana_crimes.csv', function(error, data) {
// d3.text('urbana_crimes_medium.csv', function(error, data) {
// d3.text('urbana_crimes_small.csv', function(error, data) {
    if (error) throw error;
    context = d3.csvParse(data).map(function (d) {


        // map data (location, city, type of crime)
        var point = d['ARRESTEE HOME CITY - MAPPED'].split(/[(]/).slice(1);
        if (point.length) {
            d.point = point.toString().match(/[+-]?\d+(?:\.\d+)?/g);
            d.point[0] = +d.point[0]; // latitude
            d.point[1] = +d.point[1]; // longitude
            d.point[2] = d['ARRESTEE HOME CITY']; // city
            d.point[3] = d['CRIME CODE DESCRIPTION']; // crime
        }
        return d.point;
    });

    // filter data
    context = context.filter(function (d) {
        if (!d) return false;

        if (d.length !== 4) {
            return false;
        }

        if (isNaN(d[0]) || isNaN(d[1]) || d[0] < 20 || d[0] > 50 || d[1] < -110 || d[1] > -70) {
            return false;
        }

        // count criminals per city
        if (d[2].includes('URBANA')) {
            city_counter[0]++;
        } else if (d[2].includes('CHICAGO')) {
            city_counter[1]++;
        } else if (d[2].includes('JACKSONVILLE')) {
            city_counter[2]++;
        } else if (d[2].includes('WASHINGTON')) {
            city_counter[3]++;
        } else if (d[2].includes('KANSAS')) {
            city_counter[4]++;
        } else if (d[2].includes('NASHVILLE')) {
            city_counter[5]++;
        } else if (d[2].includes('ATLANTA')) {
            city_counter[6]++;
        } else if (d[2].includes('MINNEAPOLIS')) {
            city_counter[7]++;
        }

        return true;
    });


    // // add criminal locations TOO SLOW
    // svg.selectAll('circle')
    //     .data(context)
    //     .enter().append('circle')
    //     .attr('r', 1)
    //     .attr('fill', 'ghostwhite')
    //     .attr('transform', function (d) {
    //         return 'translate(' + projection([
    //             d[1],
    //             d[0]
    //         ]) + ')';
    //     });



    cities = svg.append('g');
    // legend = svg.append('g');

    var tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    // add cities, lines and circles
    d3.csv('cities.csv', function (error, data) {

        cities.selectAll('text')
            .data(data)
            .enter()
            .append('text')
            .attr('id', function (d, i) {
                return 'label_' + i;
            })
            .attr('x', function (d) {
                return projection([d.longitude, d.latitude])[0];
            })
            .attr('y', function (d) {
                return projection([d.longitude, d.latitude])[1];
            })
            .style('fill', 'black')
            .attr('text-anchor', 'middle')
            .attr('font-family', 'sans-serif')
            .attr('font-weight', 'bold')
            .text(function (d) {
                return d.city;
            })
            .style('opacity', 0);

            for(let i = 0; i < data.length; ++i) {
                data[i].counter = city_counter[i];
            }
        // too expensive operation
        // cities.selectAll('circle')
        //     .data(data)
        //     .enter()
        //     .append('circle')
        //     .attr('class', 'growCircle')
        //     .attr('cx', function (d) {
        //         return projection([d.longitude, d.latitude])[0];
        //     })
        //     .attr('cy', function (d) {
        //         return projection([d.longitude, d.latitude])[1];
        //     });

        cities.selectAll('line')
            .data(data)
            .enter()
            .append('line')
            .attr('id', function (d, i) {
                return 'line_' + i;
            })
            .attr('stroke', function (d) {
                return d.color;
            })
            .attr('stroke-width', 0)
            .attr('x1', function (d) {
                return projection([
                    d.longitude,
                    d.latitude
                ])[0];
            })
            .attr('x2', projection([
                    data[0].longitude, // Urbana
                    data[0].latitude // Urbana
                ])[0]
            )
            .attr('y1', function (d) {
                return projection([
                    d.longitude,
                    d.latitude
                ])[1];
            })
            .attr('y2',
                projection([
                    data[0].longitude, // Urbana
                    data[0].latitude // Urbana
                ])[1]
            );

        cities.selectAll('circle')
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'centerCircle')
            .attr('cx', function (d) {
                return projection([d.longitude, d.latitude])[0];
            })
            .attr('cy', function (d) {
                return projection([d.longitude, d.latitude])[1];
            })
            .attr('r', 15)
            .attr('stroke-width', 3)
            .style('stroke', 'black')
            .style('fill', 'red')
            .on('mouseover', function (d, i) {

                if (!pinned[i]) {
                    d3.select(this)
                        .transition()
                        .duration(100)
                        .attr('r', Math.log(data[i].counter + 1) * 10)
                        .attr('stroke-width', 1)
                        .style('fill', function (d) {
                            return d.color;
                        })
                        .style('opacity', .45);

                    d3.select('#label_' + i)
                        .transition()
                        .duration(500)
                        .attr('dy', (Math.log(data[i].counter + 1) * 10 + 12) * (data[0].latitude <= d.latitude ? -1 : 1.2))
                        .style('opacity', 1);

                    d3.select('#line_' + i)
                        .transition()
                        .attr('stroke-width', Math.log(data[i].counter + 1));
                } else {

                    tooltip.transition()
                        .duration(800)
                        .style('opacity', 0.9);

                    tooltip.html('click to unpin')
                        .style('left', (d3.event.pageX + 10) + 'px')
                        .style('top', (d3.event.pageY - 35) + 'px');


                }
            })
            .on('mouseout', function (d, i) {
                tooltip.transition()
                    .duration(100)
                    .style('opacity', 0);
                if (!pinned[i]) {
                    d3.select(this)
                        .transition()
                        .attr('r', 15)
                        .style('fill', 'red')
                        .attr('stroke-width', 3)
                        .style('opacity', 1);

                    d3.select('#label_' + i)
                        .transition()
                        .attr('dy', 0)
                        .style('opacity', 0);

                    d3.select('#line_' + i)
                        .transition()
                        .attr('stroke-width', 0);
                }
            })
            .on('click', function (d, i) {
                pinned[i] = !pinned[i];

                let newdata = [];
                let j, k = 0;
                for (j = 0; j < pinned.length; ++j) {
                    if (pinned[j])
                        newdata[k++] = data[j];
                }
                
                if (pinned[i]) {
                    d3.select(this)
                        .transition()
                        .attr('r', 10)
                        .style('fill', function (d) {
                            return d.color;
                        })
                        .attr('stroke-width', 3)
                        .style('opacity', 1);

                    d3.select('#label_' + i)
                        .transition()
                        .attr('dy', 10 * (data[0].latitude <= d.latitude ? -2 : 2.5))
                        .style('opacity', 0.2);

                    popin(newdata);

                } else {
                    d3.select(this)
                        .transition()
                        .duration(100)
                        .attr('r', 15)
                        .attr('stroke-width', 1)
                        .style('fill', function (d) {
                            return d.color;
                        })
                        .style('opacity', .45);

                    d3.select('#label_' + i)
                        .transition()
                        .duration(100)
                        .attr('dy', 15 * (data[0].latitude <= d.latitude ? -1.5 : 2.5))
                        .style('opacity', 1);

                    d3.select('#line_' + i)
                        .transition()
                        .attr('stroke-width', Math.log(data[i].counter + 1));
                    updatePopup(newdata);
                    // popout();
                }
            });



        // legend.selectAll('rect')
        //     .data(data)
        //     .enter()
        //     .append('rect')
        //     .attr('id', 'rect-points')
        //     .attr('x', 8.5 * svgWidth / 10)
        //     .attr('y', function (d, i) {
        //         return 6 * svgHeight / 10 + i * 20;
        //     })
        //     .attr('width', 10)
        //     .attr('height', 10)
        //     .style('fill', function (d) {
        //         return d.color;
        //     });
        //
        // legend.selectAll('text')
        //     .data(data)
        //     .enter()
        //     .append('text')
        //     .attr('x', 8.5 * svgWidth / 10)
        //     .attr('y', function (d, i) {
        //         return 6 * svgHeight / 10 + i * 20;
        //     })
        //     .attr('dx', 17)
        //     .attr('dy', 10)
        //     .style('fill', 'black')
        //     .attr('text-anchor', 'start')
        //     .attr('font-family', 'sans-serif')
        //     .text(function (d, i) {
        //         return d.city + ': ' + d.counter;
        //     });
    });
}); // end d3.text

var popup;

function updatePopup(data) {
    var update = popup.selectAll('#textdata')
        .data(data, function (d) {
            return d;
        });

    update.enter()
        .append('text')
        .attr('id', 'textdata')
        .attr('x', 0)
        .attr('y', function (d, i) {
            return i * 20 + 30;
        })
        .attr('dx', 17)
        .attr('dy', 10)
        .style('fill', 'black')
        .attr('text-anchor', 'start')
        .attr('font-family', 'sans-serif')
        .text(function (d) {
            return d.city + ': ' + d.counter;
        });

    update.text(function (d) {
        return d.city + ': ' + d.counter;
    });

    update.exit()
        .remove();
}


function drawTable(data) {

}

function popin(data) {
    popout();
    popup = d3.select('svg')
        .append('g')
        .attr('id', 'popup')
        .append('svg')
        .attr('height', 200)
        .attr('width', 300)
        .attr('x', 620)
        .attr('y', 420);

    popup.append('rect')
        .attr('width', 300)
        .attr('height', 200)
        .style('fill', 'ghostwhite')
        .style('stroke', 'black');

    popup.append('text')
        .text('<< close me, or drag me around!')
        .attr('x', 25)
        .attr('y', 15)
        .style('fill', 'red');

    var close = popup.append('g');

    close.append('rect')
        .attr('x', 3)
        .attr('y', 3)
        .attr('width', 20)
        .attr('height', 20)
        .style('stroke', 'black')
        .style('fill', 'grey');

    close.append('line')
        .attr('id', 'closeline1')
        .attr('x1', 6)
        .attr('x2', 20)
        .attr('y1', 6)
        .attr('y2', 20)
        .style('stroke', 'black');

    close.append('line')
        .attr('id', 'closeline2')
        .attr('x1', 20)
        .attr('x2', 6)
        .attr('y1', 6)
        .attr('y2', 20)
        .style('stroke', 'black');

    close.on('click', function () {
        popout();
    });

    popup.call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged));

    updatePopup(data);


    // .attr('style', 'outline: thin solid black;');
        // .attr('class', 'tooltip')
        // .append('button')
        // .attr("type","button")
        // .attr('onclick', 'popout()');

    // div.append('rect')
    //     .attr('x', 0)
    //     .attr('y', 0)
    //     .attr('width', 100)
    //     .attr('height', 100)
    //     .style('fill', 'green');


    // popup.html('crimes: ' + d.counter)
    //     .style('left', (d3.event.pageX) + 'px')
    //     .style('top', (d3.event.pageY) + 'px');
}

function popout() {
    // div.transition()
    //     .duration(100)
    //     .style('opacity', 0);
    if(popup)
        d3.select('#popup').remove();
}
var oldx;
var oldy;

function dragstarted() {

     oldx = Math.abs((d3.select('#popup').select('svg').attr('x')) - d3.event.x);
     oldy = Math.abs((d3.select('#popup').select('svg').attr('y')) - d3.event.y);
}

function dragged() {

    d3.select('#popup')
        .select('svg')
        .attr('x', d3.event.x - oldx)
        .attr('y', d3.event.y - oldy);
}


