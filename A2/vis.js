var cityNum = 8;

var context = [];

var svgHeight = 600;
var svgWidth = 950;

var cities;
// var legend;
var body = d3.select('body')
    .append('div')
    .style('width', 3* svgWidth / 2 + 80 + 'px')
    .style('height', svgHeight + 30 + 'px')
    .style('overflow', 'hidden');


var svg = body
    .append('div')
    .style('width', svgWidth + 20 + 'px')
    .style('height', svgHeight + 20 + 'px')
    .style('float', 'left')
    .style('padding-left', 10 + 'px')
    .style('padding-top', 10 + 'px')
    .append('svg')
    .attr('height', svgHeight)
    .attr('width', svgWidth)
    .attr('class', 'map');

// setup tableView
var tableView = body
    .append('div')
    .style('margin-top', 10 + 'px')
    .append('svg')
    .attr('id', 'tpsreports')
    .attr('height', svgHeight)
    .attr('width', svgWidth / 2)
    .style('outline', 'thin solid black');

var defs = tableView.append('defs');

defs.append('pattern')
    .attr('id', 'pcloadletter')
    .attr('patternContentUnits', 'objectBoundingBox')
    .attr('width', '100%')
    .attr('height', '100%')
    .append('image')
    .attr('preserveAspectRatio', 'none')
    .attr('xlink:href', 'pcloadletter.jpeg')
    .attr('width', 1);

tableView.append('rect')
    .attr('width', svgWidth / 2)
    .attr('height', svgHeight)
    .style('fill', 'url(#pcloadletter)')
    .style('opacity', 0.9)
    .style('stroke', 'black');


var projection = d3.geoMercator()
    .scale(1300)
    .translate([svgWidth / .410, svgHeight / .50]);

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
        .attr('transform', 'translate(' + 0 + ',' + svgHeight * .917 + ')')
        .call(d3.axisBottom(x_scale));

    svg.append('g')
        .attr('transform', 'translate(' + svgWidth * .0525 + ',' + -50 + ')')
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
            d.context = point.toString().match(/[+-]?\d+(?:\.\d+)?/g);
            d.context[0] = +d.context[0]; // latitude
            d.context[1] = +d.context[1]; // longitude
            d.context[2] = d['ARRESTEE HOME CITY']; // city
            d.context[3] = +d['AGE AT ARREST']; // age
            d.context[4] = +d['YEAR OF ARREST']; // year
            d.context[5] = d['CRIME CODE DESCRIPTION']; // crime
        }
        return d.context;
    });

    // filter data
    context = context.filter(function (d) {
        if (!d) return false;

        if (d.length !== 6) {
            return false;
        }

        if (isNaN(d[0]) || isNaN(d[1]) || d[0] < 20 || d[0] > 50 || d[1] < -110 || d[1] > -70) {
            return false;
        }

        if (d[3] < 1 || d[3] > 120) {
            return false;
        }

        return d[2].toUpperCase().includes('URBANA') ||
            d[2].toUpperCase().includes('CHICAGO') ||
            d[2].toUpperCase().includes('JACKSONVILLE') ||
            d[2].toUpperCase().includes('WASHINGTON') ||
            d[2].toUpperCase().includes('KANSAS') ||
            d[2].toUpperCase().includes('NASHVILLE') ||
            d[2].toUpperCase().includes('ATLANTA') ||
            d[2].toUpperCase().includes('MINNEAPOLIS');

    });

    var cityCounter = d3.nest()
        .key(function (d) {
            return d[2];
        }).rollup(function (d) {
            return d3.sum(d, function () {
                return 1;
            });
        }).entries(context);


    cities = svg.append('g');

    var tooltip = d3.select('body')
        .append('div')
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

        data.forEach(function (d, i) {
            d.counter = cityCounter[i].value;
            d.pinned = false;
        });



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

        var mouseOnCity = false;

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
                mouseOnCity = true;
                if (!d.pinned) {
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

                    tooltip.html('click to unpin or mousedrag a selection frame for multi unpinning')
                        .style('left', (d3.event.pageX + 35) + 'px')
                        .style('top', (d3.event.pageY - 35) + 'px');


                }
            })
            .on('mouseout', function (d, i) {
                mouseOnCity = false;
                tooltip.transition()
                    .duration(100)
                    .style('opacity', 0);
                if (!d.pinned) {
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
                d.pinned = !d.pinned;

                let newdata = [];
                data.forEach(function (d) {
                    if (d.pinned)
                        newdata.push(d);
                });

                if (d.pinned) {
                    d3.select(this)
                        .transition()
                        .attr('r', 10)
                        .style('fill', function () {
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
                        .style('fill', function () {
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
                        .attr('stroke-width', Math.log(d.counter + 1));
                    updateTable(newdata);
                }
            });


        function popin(data) {
            popout();

            let popupHeight = 200;
            let popupWidth = 300;

            popup = d3.select('svg')
                .append('g')
                .attr('id', 'popup')
                .append('svg')
                .attr('x', svgWidth - popupWidth - 60)
                .attr('y', svgHeight - popupHeight - 80);

            popup.append('rect')
                .attr('class', 'popup')
                .attr('x', 5*10);

            popup.append('text')
                .text('AGE')
                .attr('x', 300)
                .attr('y', 30)
                .style('fill', 'red');

            var close = popup.append('g');

            close.append('rect')
                .attr('x', 3)
                .attr('y', 3)
                .attr('width', 20)
                .attr('height', 13)
                .style('fill', 'blanchedalmond')
                .style('stroke', 'black');

            close.append('line')
                .attr('id', 'closeline1')
                .attr('x1', 6)
                .attr('x2', 20)
                .attr('y1', 6)
                .attr('y2', 13)
                .style('stroke', 'black');

            close.append('line')
                .attr('id', 'closeline2')
                .attr('x1', 20)
                .attr('x2', 6)
                .attr('y1', 6)
                .attr('y2', 13)
                .style('stroke', 'black');

            close.on('mouseover', function () {
                d3.select(this)
                    .select('rect')
                    .style('fill', 'red');
                d3.select(this)
                    .selectAll('line')
                    .style('stroke', 'ghostwhite');

            }).on('mouseout', function () {
                d3.select(this)
                    .select('rect')
                    .style('fill', 'blanchedalmond');
                d3.select(this)
                    .selectAll('line')
                    .style('stroke', 'black');
                }
            ).on('click', function () {
                d3.select(this)
                popout();
            });

            popup.call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged));

            updatePopup(context);
            updateTable(data);
        }

        function popout() {
            if(popup)
                d3.select('#popup')
                    .remove();
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

        var popup;

        function updatePopup(data) {
            if (popup != null) {
                let popupHeight = 200;
                let popupWidth = 300;
                let histopadding = 10;

                let ageLimits = d3.extent(data, function (d) {
                    return d[3];
                });
                var yh = d3.scaleLinear()
                    .range([popupHeight - histopadding/2, histopadding]);

                var xh = d3.scaleLinear()
                    .domain(ageLimits)
                    .rangeRound([histopadding, popupWidth - histopadding]);


                var histogram = d3.histogram()
                    .domain(xh.domain())
                    .thresholds(xh.ticks(10))
                    .value(function(d) {
                        return d[3]; // age
                    });


                var bins = histogram(data);

                yh.domain([0, d3.max(bins, function(d) { return d.length; })]);

                popup.append('g')
                    .attr('transform', 'translate(' + 5*histopadding + ',' + popupHeight + ')')
                    .call(d3.axisBottom(xh));

                popup.append('g')
                    .attr('transform', 'translate(' + (5*histopadding - .6) +  ',' + 0 + ')')
                    .call(d3.axisLeft(yh));

                var update = popup.selectAll('.bars')
                    .data(bins, function (d) {
                        return d;
                    });

                update.enter()
                    .append('rect')
                    .attr('class', 'bar')
                    .attr('x', 5*histopadding)
                    .attr('y', -histopadding/2)
                    .attr('transform', function(d) {
                        return "translate(" + xh(d.x0) + "," + yh(d.length) + ")"; })
                    .attr('width', function(d) {
                        return xh(d.x1) - xh(d.x0) - 2;
                    })
                    .attr('height', function(d) {
                        return popupHeight - yh(d.length);
                    });

                update.attr('height', function(d) {
                    return popupHeight - yh(d.length);
                });

                update.exit()
                    .remove();
            }
        }


        var printer = (['Excuse', 'me,', 'I', 'believe', 'you', 'have', 'my', 'stapler.']);


        function updateTable(data) {

            var update = tableView.selectAll('#gangsterdata')
                .data(data);

            update.enter()
                .append('text')
                .attr('id', 'gangsterdata')
                .attr('x', 0)
                .attr('y', function (d, i) {
                    return i * 20 + 20;
                })
                .attr('dx', 17)
                .attr('dy', 10)
                .style('fill', 'orange')
                .attr('text-anchor', 'start')
                .attr('font-family', 'sans-serif')
                .text(function (d) {
                    return printer[d.id] + ' : ' + d.counter;
                });

            update.text(function (d) {
                return printer[d.id] + ' : ' + d.counter;
            });

            update.exit()
                .remove();

        }


        // the code for band selection below was inspired by http://bl.ocks.org/lgersman/5311083

        var holdStarter = null;
        var holdDelay = 200;
        var holdActive = false;

        svg.on('mousedown', mousedown)
            .on('mousemove', mousemove)
            .on('mouseup', mouseup);

        function mouseup(){
            if (holdStarter) {
                clearTimeout(holdStarter);
                d3.select('#selFr').remove();
            }
            else if (holdActive) {
                holdActive = false;
                let circlesToSelect = d3.selectAll('circle.centerCircle');
                let selFr = d3.select('#selFr');

                circlesToSelect.each(function (d, i) {

                    let x = projection([d.longitude, d.latitude])[0];
                    let y = projection([d.longitude, d.latitude])[1];
                    let r = +selFr.attr('r');
                    let sFx = +selFr.attr('x');
                    let sFy = +selFr.attr('y');
                    let sFwidth = +selFr.attr('width');
                    let sFheight = +selFr.attr('height');


                    if (x - r >= sFx && x + r <= sFx + sFwidth &&
                        y - r >= sFy && y + r <= sFy + sFheight) {

                        data[i].pinned = false;

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
                });

                let newdata = [];


                data.forEach(function (d) {
                    if (d.pinned)
                        newdata.push(d);
                });
                // updatePopup(newdata);
                updateTable(newdata);


            }
            d3.select('#selFr').remove();
        }

        function mousedown() {
            if (!mouseOnCity) {
                var m = d3.mouse(this);

                svg.append('rect')
                    .attr('id', 'selFr')
                    .attr('class', 'selection')
                    .attr('x', m[0])
                    .attr('y', m[1])
                    .attr('height', 0)
                    .attr('width', 0);

                holdStarter = setTimeout(function () {
                    holdStarter = null;
                    holdActive = true;
                    // begin hold-only operation here, if desired
                }, holdDelay);
            }
        }

        function mousemove() {

            let m = d3.mouse(this);
            let selFr = d3.select('#selFr');
            if (!selFr.empty()) {
                let move = [2];
                let pos = [4];
                pos.x = +selFr.attr('x');
                pos.y = +selFr.attr('y');
                pos.width = +selFr.attr('width');
                pos.height = +selFr.attr('height');

                move.x = m[0] - pos.x;
                move.y = m[1] - pos.y;

                if( move.x < 1 || (move.x*2<pos.width)) {
                    pos.x = m[0];
                    pos.width -= move.x;
                } else {
                    pos.width = move.x;
                }

                if( move.y < 1 || (move.y*2<pos.height)) {
                    pos.y = m[1];
                    pos.height -= move.y;
                } else {
                    pos.height = move.y;
                }

                selFr.attr('x', pos.x);
                selFr.attr('y', pos.y);
                selFr.attr('width', pos.width);
                selFr.attr('height', pos.height);

            }
        }

        var yearMax = d3.max(context, function (d) {
            return d[4];
        });

        var yearRange = 10;

        var years = d3.range(0, yearRange).map(function (d) { return new Date(+yearMax - yearRange + 1 + d, 1, 1); });

        var slider3 = d3.sliderHorizontal()
            .min(d3.min(years))
            .max(d3.max(years))
            .step(1000 * 60 * 60 * 24 * 365)
            .width(400)
            .tickFormat(d3.timeFormat('%Y'))
            .tickValues(years)
            .on('onchange', val => {
                d3.select("p#value3").text(d3.timeFormat('%Y')(val));
            });

        var group3 = d3.select("#tpsreports").append("svg")
            .attr("width", 500)
            .attr("height", 100)
            .attr('y', 500)
            .append("g")
            .attr("transform", "translate(30,30)");

        group3.call(slider3);

        d3.select("p#value3").text(d3.timeFormat('%Y')(slider3.value()));
        d3.select("a#setValue3").on("click", () => { slider3.value(new Date(1997, 1, 1)); d3.event.preventDefault(); });

        function yearFilter(data, year) {
            return data.filter(function (d) {
                return d[4] === year;
            });
        };

        function cityFilter(data, context) {

            let newdata = [];
            data.forEach(function (d) {
                if (d.pinned)
                    newdata.push(d);
            });

            let filteredData = [];
            newdata.forEach(function (d) {
                context.forEach(function (k) {
                    console.log(d.city.toUpperCase(), k[2].toUpperCase());
                    if (k[2].toUpperCase().includes(d.city.toUpperCase())) {
                        // console.log(k);
                        filteredData.push(k);
                    }
                });
            });

            return filteredData;
        }

        //testcode:
        // data[0].pinned = true;
        // data[1].pinned = true;
        // data[2].pinned = true;
        // data[3].pinned = true;
        // data[4].pinned = true;
        // data[5].pinned = true;
        //
        // // console.log(data)
        // var testdata = yearFilter(context, 2000);
        // testdata = cityFilter(data, testdata);
        // // console.log(testdata);
        // console.log(testdata);

    });
}); // end d3.text