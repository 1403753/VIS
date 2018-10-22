var city_counter = new Array(8).fill(0);

var svgHeight = 700;
var svgWidth = 950;

var svg = d3.select('body')
    .append('svg')
    .attr('height', svgHeight)
    .attr('width', svgWidth)
    .attr('style', 'outline: thin solid black;');

var projection = d3.geoMercator()
    .scale(1300)
    .translate([svgWidth / .385, svgHeight / .56]);

var path = d3.geoPath()
    .projection(projection);

var graticule = d3.geoGraticule();

svg.append('path')
    .datum(graticule)
    .attr('class', 'graticule')
    .attr('d', path);

var context = [];

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

        if (d.length != 4) {
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

    // // add criminal locations
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

    var cities = svg.append('g');
    var centers = svg.append('g')
    var legend = svg.append('g');

    // add cities, lines and circles
    d3.csv('cities.csv', function (error, data) {

        centers.selectAll('text')
            .data(data)
            .enter()
            .append('text')
            .attr('id', function (d, i) {
                return 't' + '_' + i;
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
            .attr('opacity', 0);

        cities.selectAll('circle')
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'growCircle')
            .attr('cx', function (d) {
                return projection([d.longitude, d.latitude])[0];
            })
            .attr('cy', function (d) {
                return projection([d.longitude, d.latitude])[1];
            });

        cities.selectAll('line')
            .data(data)
            .enter()
            .append('line')
            .attr('stroke', function (d) {
                return d.color;
            })
            .attr('stroke-width', function (d) {
                return Math.log(city_counter[d.id] + 1);
            })
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

        centers.selectAll('circle')
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
            .attr('r', 10)
            .attr('stroke-width', 1)
            .style('stroke', 'black')
            .style('fill', 'ghostwhite')
            .on('mouseover', function (d, i) {
                d3.select(this)
                    .transition()
                    .attr('r', function (d) {
                        return Math.log(city_counter[d.id] + 1) * 10;
                    })
                    .style('fill', function (d) {
                        return d.color;
                    })
                    .style('opacity', .45);

                d3.select('#t' + '_' + i)
                    .transition()
                    .attr('opacity', 1)
                    .attr('dy', function () {
                        return (Math.log(city_counter[d.id] + 1) * 10 + 12) * (data[0].latitude <= d.latitude ? -1 : 1.2);
                    });
            })
            .on('mouseout', function (d, i) {
                d3.select(this)
                    .transition()
                    .attr('r', 10)
                    .style('fill', 'ghostwhite')
                    .style('opacity', 1);

                d3.select('#t' + '_' + i)
                    .transition()
                    .attr('dy', 0)
                    .attr('opacity', 0);
            });


        legend.selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('x', 8.5 * svgWidth / 10)
            .attr('y', function (d) {
                return 6 * svgHeight / 10 + d.id * 20;
            })
            .attr('width', 10)
            .attr('height', 10)
            .style('fill', function (d) {
                return d.color;
            });

        legend.selectAll('text')
            .data(data)
            .enter()
            .append('text')
            .attr('x', 8.5 * svgWidth / 10)
            .attr('y', function (d) {
                return 6 * svgHeight / 10 + d.id * 20;
            })
            .attr('dx', 17)
            .attr('dy', 10)
            .style('fill', 'black')
            .attr('text-anchor', 'start')
            .attr('font-family', 'sans-serif')
            .text(function (d) {
                return d.city + ': ' + city_counter[d.id];
            });
    });

});