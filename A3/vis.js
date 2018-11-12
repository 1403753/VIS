var context = [];
var parseDate = d3.timeParse('%m/%d/%Y');

var svgHeight = 650;
var svgWidth = 910;
var popupHeight = 200;
var popupWidth = 300;
var barViewHeight = svgHeight / 2 - 5;
var barViewWidth = svgWidth / 2;
var rightViewHeight =  svgHeight / 2 - 5;
var rightViewWidth =  svgWidth * .65;

var histopadding = 10;
var cities;

var body = d3.select('body')
    .append('div')
    // .style('width', 3 * svgWidth / 2 + 160 + 'px')
    .style('width', '100%')
    // .style('height', svgHeight + 10 + 'px')
    .style('height', '100%')
    .style('overflow', 'hidden');

var svg = body.append('div')
    // .style('width', svgWidth + 10 + 'px')
    .style('width', '60%')
    // .style('height', svgHeight + 10 + 'px')
    .style('height', '100%')
    .style('float', 'left')
    .style('padding-left', 5 + 'px')
    .style('padding-top', 5 + 'px')
    .append('svg')
    .style('margin-right', 50 + 'px')
    .attr('height', svgHeight)
    .attr('width', svgWidth)
    .attr('class', 'map');

var projection = d3.geoMercator()
    .scale(1300)
    .translate([svgWidth / .406, svgHeight / .50]);

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
        .attr('transform', 'translate(' + 70 + ',' + (svgHeight - 30) + ')')
        .text('(miles)', 'sans-serif');
});


var barView = svg.append('g')
    .append('svg')
    .attr('id', 'barView')
    .attr('class', 'view')
    .attr('height', barViewHeight)
    .attr('width', barViewWidth)
    .attr('x', svgWidth - barViewWidth + 30)
    .attr('y', -5);
    // .style('outline', 'thin solid black');

/////////////
// ageView //
/////////////
var ageView = body.append('div')
    .style('margin-top' , 5 + 'px')
    .style('margin-left', 5 + 'px')
    .append('svg')
    .attr('id', 'scatterView')
    .attr('class', 'view')
    .attr('height', rightViewHeight)
    .attr('width', rightViewWidth)
    .style('outline', 'thin solid black');

var ctxBars = ageView.append('g')
    .attr('id', 'ctxAgeBars');

var ageBrush = d3.brushX()
    .extent([[55, 10], [rightViewWidth - 15, 50]]);

ageView.append('g')
    .attr('class', 'ageBrush')
    .attr('transform', 'translate(' + 0 + ',' + (rightViewHeight - 90) + ')');


ageView.append('defs')
    .append('clipPath')
    .attr('id', 'clip')
    .append('rect')
    .attr('width', rightViewWidth - 70)
    .attr('height', rightViewHeight)
    .attr('x', 55);

var x1Age = d3.scaleLinear().range([55, rightViewWidth - 15]);
var y1Age = d3.scaleLinear().range([rightViewHeight - 110 , 10]);

var x2Age = d3.scaleLinear().range([55, rightViewWidth - 15]);
var y2Age = d3.scaleLinear().range([rightViewHeight - 40, rightViewHeight - 75]);


var bars = ageView.append('g')
    .attr('id', 'ageBars');

var x1AgeAxis = d3.axisBottom(x1Age);
var x2AgeAxis = d3.axisBottom(x2Age);
var yAgeAxis = d3.axisLeft(y1Age);

ageView.append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', 'translate(0,' + (rightViewHeight - 105) + ')');

ageView.append('g')
    .attr('class', 'axis x2-axis')
    .attr('transform', 'translate(0,' + (rightViewHeight - 40) + ')');

ageView.append('g')
    .attr('class', 'axis y-axis')
    .attr('transform', 'translate(52,' + 0 + ')');

ageView.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 15)
    .attr('x', -(rightViewHeight / 3))
    .style('text-anchor', 'middle')
    .text('Crimes');

ageView.append('text')
    .attr('x', rightViewWidth / 2)
    .attr('y', rightViewHeight - 10)
    .style('text-anchor', 'middle')
    .text('Age');

///////////////////
//  scatterView  //
///////////////////
var scatterView = body.append('div')
    .style('margin-top' , 5 + 'px')
    .style('margin-left', 5 + 'px')
    .append('svg')
    .attr('id', 'scatterView')
    .attr('class', 'view')
    .attr('height', rightViewHeight)
    .attr('width', rightViewWidth)
    .style('outline', 'thin solid black');

var scatBrush = d3.brushX()
    .extent([[55, 10], [rightViewWidth - 15, 50]]);

scatterView.append('g')
    .attr('class', 'scatBrush')
    .attr('transform', 'translate(' + 0 + ',' + (rightViewHeight - 90) + ')');


scatterView.append('defs')
    .append('clipPath')
    .attr('id', 'clip2')
    .append('rect')
    .attr('width', rightViewWidth - 70)
    .attr('height', rightViewHeight)
    .attr('x', 55);

var x1Scatter = d3.scaleTime().range([55, rightViewWidth - 15]);
var y1Scatter = d3.scaleLinear().range([rightViewHeight - 110 , 10]);

var x2Scatter = d3.scaleTime().range([55, rightViewWidth - 15]);
var y2Scatter = d3.scaleLinear().range([rightViewHeight - 40, rightViewHeight - 75]);

var dots = scatterView.append('g')
    .attr('id', 'scatterDots');

var ctxDots = scatterView.append('g')
    .attr('id', 'contextScatterDots');


var x1ScatterAxis = d3.axisBottom(x1Scatter);
var x2ScatterAxis = d3.axisBottom(x2Scatter);
var yScatterAxis = d3.axisLeft(y1Scatter);

scatterView.append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', 'translate(0,' + (rightViewHeight - 105) + ')');

scatterView.append('g')
    .attr('class', 'axis x2-axis')
    .attr('transform', 'translate(0,' + (rightViewHeight - 40) + ')');

scatterView.append('g')
    .attr('class', 'axis y-axis')
    .attr('transform', 'translate(50,' + 0 + ')');

scatterView.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 15)
    .attr('x', -(rightViewHeight / 3))
    .style('text-anchor', 'middle')
    .text('Cartesian map distance');

scatterView.append('text')
    .attr('x', rightViewWidth / 2)
    .attr('y', rightViewHeight - 10)
    .style('text-anchor', 'middle')
    .text('Date');

d3.text('urbana_reduced.csv', function(error, data) {
    if (error) throw error;

    context = d3.csvParse(data, function (d) {

        d.context = [8];
        d.context[0] = +d['LATITUDE']; // latitude
        d.context[1] = +d['LONGITUDE']; // longitude
        d.context[2] = d['ARRESTEE HOME CITY']; // city
        d.context[3] = +d['AGE AT ARREST']; // age
        d.context[4] = parseDate(d['DATE OF ARREST']); // date
        // d.context[5] := distance
        return d.context;
    });

    var cityCounter = d3.nest()
        .key(function (d) {
            return d[2];
        }).rollup(function (d) {
            return d3.sum(d, function () {
                return 1;
            });
        })
        .entries(context);

    cities = svg.append('g');

    // add cities, lines and circles
    d3.csv('cities.csv', function (error, data) {


        data.forEach(function (d) {
            cityCounter.forEach(function (c) {
                if (d.city.toUpperCase().includes(c.key.toUpperCase()))
                    d.counter = c.value;
            });
            d.pinned = false;
        });

        let urbXY = projection([data[0].longitude, data[0].latitude]);
        context.forEach(function (d) {
            let cXY = projection([d[1], d[0]]);
            let xlen = (urbXY[0] - cXY[0]);
            let ylen = (urbXY[1] - cXY[1]);
            d[5] = Math.sqrt(xlen*xlen + ylen*ylen);
        });

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
        var tooltip;

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
                    tooltip = body.append('div')
                        .attr('id', 'tooltip')
                        .attr('class', 'tooltip')
                        .style('opacity', 0);

                    tooltip.transition()
                        .duration(800)
                        .style('opacity', 0.9);

                    tooltip.html('click to unpin or drag a selection frame over un/pinned cities for multi un/pinning')
                        .style('left', (d3.event.pageX + 35) + 'px')
                        .style('top', (d3.event.pageY - 35) + 'px');


                }
            })
            .on('mouseout', function (d, i) {
                mouseOnCity = false;
                if (tooltip) {
                    tooltip.transition()
                        .duration(500)
                        .style('opacity', 0)
                        .remove();
                }

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
                    tooltip = body.append('div')
                        .attr('id', 'tooltip')
                        .attr('class', 'tooltip')
                        .style('opacity', 0);

                    tooltip.transition()
                        .duration(800)
                        .style('opacity', 0.9);

                    tooltip.html('click to unpin or drag a selection frame over un/pinned cities for multi un/pinning')
                        .style('left', (d3.event.pageX + 35) + 'px')
                        .style('top', (d3.event.pageY - 35) + 'px');

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
                    if (!popup.open)
                        popin();
                    else
                        updatePopup();

                    updateTable(newdata);
                } else {
                    if (tooltip) {
                        tooltip.transition()
                            .duration(500)
                            .style('opacity', 0)
                            .remove();
                    }
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
                    updatePopup();
                    updateTable(newdata);

                }
            });

        var popup = [];
        popup.open = false;

        var [currentYear, yearMax] = d3.extent(context, function (d) {
            return d[4].getFullYear();
        });

        var yearSpan = yearMax - currentYear < 17 ? yearMax - currentYear : 16;

        currentYear = yearMax - yearSpan;

        var range = [currentYear, yearMax];

        var years = d3.range(0, yearSpan + 1).map(function (d) { return currentYear + d; });

        function popin() {
            updateScatterView();
            popup = d3.select('svg')
                .append('g')
                .attr('id', 'popup')
                .append('svg')
                .attr('id', 'popupWindow')
                .attr('x', svgWidth - popupWidth - 80)
                .attr('y', svgHeight - popupHeight - 140);

            popup.open = true;

            popup.append('rect')
                .attr('class', 'popup')
                .attr('x', 5*histopadding);

            popup.append('text')
                .attr('id', 'popupText')
                .attr('x', 57.5)
                .attr('y', 15)
                .style('fill', 'red');

            let close = popup.append('g');

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
                popout();
            });

            popup.call(
                d3.drag()
                .on('start', popupDragstarted)
                .on('drag', popupDragged)
            );

            let ageRange = [5, 95];

            let threshold = d3.range(ageRange[0], ageRange[1], (ageRange[1] - ageRange[0]) / 20);
            let yh = d3.scaleLinear()
                .range([popupHeight - histopadding / 2, histopadding]);

            let xh = d3.scaleLinear()
                .domain(ageRange)
                .rangeRound([histopadding, popupWidth - histopadding]);

            let histogram = d3.histogram()
                .domain(xh.domain())
                .thresholds(threshold)
                .value(function (d) {
                    return d[3]; // age
                });


            let bins = histogram([]);

            yh.domain([0, d3.max(bins, function (d) {
                return d.length;
            })]);

            popup.append('g')
                .attr('id', 'xh')
                .attr('transform', 'translate(' + 5 * histopadding + ',' + popupHeight + ')')
                .call(d3.axisBottom(xh));

            popup.append('g')
                .attr('id', 'yh')
                .attr('transform', 'translate(' + (5 * histopadding - .6) + ',' + 0 + ')')
                .call(d3.axisLeft(yh));

            popup.append('text')
                .attr('x', (popupWidth + 5*histopadding) / 2 + 20)
                .attr('y',  popupHeight + 30)
                .style('text-anchor', 'middle')
                .text('Age');

            popup.append('text')
                .attr('x', (popupWidth + 5*histopadding) / 2 + 20)
                .attr('y',  popupHeight + 80)
                .style('text-anchor', 'middle')
                .text('Year');

            popup.append('text')
                .attr('transform', 'rotate(-90)')
                .attr('x', -((popupHeight) / 2) )
                .attr('y', 2*histopadding - 3)
                .style('text-anchor', 'middle')
                .text('Crimes');


            popup.selectAll('#popupBar')
                .data(bins, function (d) {
                    return d;
                })
                .enter()
                .append('rect')
                .attr('id', 'popupBar')
                .attr('class', 'bar')
                .attr('transform', function (d) {
                    return 'translate(' + (xh(d.x0) + 5 * histopadding) + ',' + (yh(d.length)) + ')';
                })
                .attr('width', function (d) {
                    return xh(d.x1) - xh(d.x0);
                });

            var slider = d3.select('#popupWindow').append('g')
                .attr('id', 'slider')
                .attr('transform', 'translate(' + 20 +', ' + (popupHeight + 40) + ')');

            let xSliderScale = d3.scaleLinear()
                .domain(range)
                .range([0, popupWidth + 5*histopadding])
                .clamp(true); // use clamp to deal with exceeding range limits

            let xSliderAxis = d3.axisBottom(xSliderScale)
                .tickValues(years)
                .tickFormat(function (d) {
                    return '\'' + d.toString().substr(-2);
                });

            // ticks
            slider.append('g')
                .attr('transform', 'translate(0, 4)')
                .call(xSliderAxis);

            // red slider line
            slider.append('line')
                .attr('stroke', 'red')
                .attr('stroke-width', 4)
                .attr('stroke-linecap', 'round')
                .attr('x1', xSliderScale.range()[0])
                .attr('x2', xSliderScale.range()[1]);

            // slider dot
            slider.append('circle')
                .attr('id','sliderDot')
                .attr('r', 8)
                .attr('stroke', 'black')
                .attr('stroke-opacity', '0.2')
                .attr('stroke-linecap', 'round')
                .attr('stroke-width', 20 + 'px')
                .call(d3.drag()
                    .on('start drag', function () {
                        sliderDragged(d3.event.x);
                    })
                    .on('end', function () {
                        updatePopup();
                        updateScatterView();
                    })
                );

            function sliderDragged(xMouse) {
                let x = xSliderScale.invert(xMouse);
                let idx = null;
                let middle;
                let xPos;
                let year;

                for (let i = 0; i < years.length - 1; ++i) {
                    if (x >= years[i] && x <= years[i + 1]) {
                        idx = i;
                        break;
                    }
                }

                middle = (years[idx] + years[idx + 1]) * .5;
                if (middle > x) {
                    xPos = xSliderScale(years[idx]);
                    year = years[idx];
                } else {
                    xPos = xSliderScale(years[idx + 1]);
                    year = years[idx + 1];
                }
                currentYear = year;
                d3.select('#sliderDot').attr('cx', xPos);
            }

            updatePopup();


        }

        function popout() {
            if (popup) {
                d3.select('#popup')
                    .remove();
                popup.open = false;
            }
        }

        function updatePopup() {

            if (popup != null) {
                let newdata = yearFilter(context, currentYear);
                newdata = cityFilter(data, newdata);

                let ageRange = [5, 95];

                let threshold = d3.range(ageRange[0], ageRange[1], (ageRange[1] - ageRange[0]) / 20);
                let yh = d3.scaleLinear()
                    .range([popupHeight - histopadding / 2, histopadding]);

                let xh = d3.scaleLinear()
                    .domain(ageRange)
                    .rangeRound([histopadding, popupWidth - histopadding]);

                let histogram = d3.histogram()
                    .domain(xh.domain())
                    .thresholds(threshold)
                    .value(function (d) {
                        return d[3]; // age
                    });


                let bins = histogram(newdata);

                yh.domain([0, d3.max(bins, function (d) {
                    return d.length;
                })]);

                d3.select('#yh')
                    .call(d3.axisLeft(yh));

                d3.selectAll('#popupBar')
                    .data(bins)
                    .transition()
                    .attr('transform', function (d) {
                        return 'translate(' + (xh(d.x0) + 5 * histopadding) + ',' + yh(d.length) + ')';
                    })
                    .attr('height', function(d) {
                        return popupHeight - yh(d.length) - 4;
                    });

                d3.select('#popupText')
                    .text('(<< close me!) ' + currentYear + ' (drag me around!)')

            }
        }


        var oldx;
        var oldy;

        function popupDragstarted() {

            oldx = Math.abs((d3.select('#popup').select('svg').attr('x')) - d3.event.x);
            oldy = Math.abs((d3.select('#popup').select('svg').attr('y')) - d3.event.y);

        }

        function popupDragged() {

            d3.select('#popup')
                .select('svg')
                .attr('x', d3.event.x - oldx)
                .attr('y', d3.event.y - oldy);
        }

        var barViewLogScale = d3.scaleLog()
            .range([barViewHeight - 60, 0])
            .domain([0, 0]);

        var yBarViewAxis = d3.axisLeft(barViewLogScale)
            .tickFormat(function (d) {
                return barViewLogScale.tickFormat(4, d3.format(',d'))(d)
            });

        barView.append('g')
            .attr('id', 'yBarView')
            .attr('transform', 'translate(' + 60 + ',' + 10 + ')')
            .call(yBarViewAxis);

        var xBarViewLabel = barView.append('text')
            .attr('x', 115)
            .attr('y',  barViewHeight - 10)
            .style('text-anchor', 'middle')
            .text('Cities');

        barView.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -((barViewHeight) / 2 - 10) )
            .attr('y', 2*histopadding - 3)
            .style('text-anchor', 'middle')
            .text('Crimes');

        var barViewCityScale = d3.scaleLinear()
            .range([100, 100]);

        var xBarViewAxis = d3.axisBottom(barViewCityScale)
            .tickFormat(d3.format('d'));

        xBarViewAxis.tickValues([]);

        barView.append('g')
            .attr('id', 'xBarView')
            .attr('transform', 'translate(' + 15 + ',' + (barViewHeight - 40) + ')')
            .call(xBarViewAxis);


        function updateTable(data) {

            let maxCounter = d3.max(data, function (d) {
                return d.counter;
            });

            barViewLogScale.domain([maxCounter, .1]);

            let pinnedCities = d3.sum(data, function (d) {
                return +d.pinned;
            });


            barViewCityScale.domain([1, pinnedCities]);

            barViewCityScale.range([100, d3.max([100, 60 + pinnedCities * 40])]);
            xBarViewLabel.transition()
                .attr('dx', d3.max([0, ((pinnedCities - 1)  * 40) / 2]));


            xBarViewAxis.tickValues(Array.from({length: pinnedCities}, (x,i) => i + 1));

            d3.select('#xBarView').call(xBarViewAxis);

            let bars = barView.selectAll('rect')
                .data(data);

            let barsEnter =  bars.enter()
                .append('rect')
                .attr('y', barViewHeight - 50);

            bars.merge(barsEnter)
                .attr('x', function(d,i){
                    return 100 + i*(30 + 10);
                })
                .style('fill', function (d) {
                    return d.color;
                })
                .transition()
                .attr('y', function(d){
                    return barViewHeight - 50 - barViewLogScale(d.counter);
                })
                .attr('width', 30)
                .attr('height', function(d){
                    return barViewLogScale(d.counter);
                });


            bars.exit()
                .transition()
                .attr('y', barViewHeight - 50)
                .attr('height', 0)
                .remove();


            let label = barView.selectAll('.gangsterdata')
                .data(data);

            label.enter()
                .append('text')
                .attr('class', 'gangsterdata')
                .attr('transform', 'rotate(-90)')
                .attr('x', function(){
                    return - (barViewHeight - 40);
                })
                .attr('y', function(d,i){
                    return 110 + i*(30 + 10);
                })
                .attr('dx', 17)
                .attr('dy', 10)
                .style('fill', 'black')
                .attr('text-anchor', 'start')
                .attr('font-family', 'sans-serif')
                .text(function (d) {
                    return d.city;
                });

            label.text(function (d) {
                return d.city;
            });

            label.exit()
                .remove();

            barViewLogScale.domain([.1, maxCounter]);

            yBarViewAxis.scale(barViewLogScale);

            d3.select('#yBarView').call(yBarViewAxis);

        }

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

                        data[i].pinned = !data[i].pinned;


                        if (data[i].pinned) {
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

                            d3.select('#line_' + i)
                                .transition()
                                .attr('stroke-width', Math.log(d.counter + 1));
                        } else {
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
                    }
                });

                let newdata = [];


                data.forEach(function (d) {
                    if (d.pinned)
                        newdata.push(d);
                });
                if (!popup.open)
                    popin();
                else
                    updatePopup();
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



        function yearFilter(data, year) {
            return data.filter(function (d) {
                return d[4].getFullYear() === year;
            });
        }

        function cityFilter(data, context) {

            let newdata = [];
            data.forEach(function (d) {
                if (d.pinned)
                    newdata.push(d);
            });

            let filteredData = [];
            newdata.forEach(function (d) {
                context.forEach(function (k) {
                    if (k[2].toUpperCase().includes(d.city.toUpperCase())) {
                        filteredData.push(k);
                    }
                });
            });

            return filteredData;
        }

        ageBrush.on('end', ageBrushed);
        scatBrush.on('end', scatterBrushed);
        drawAgeView();
        updateScatterView();

        function updateScatterView() {

            dots.selectAll('.dot').remove();
            ctxDots.selectAll('.ctxDot').remove();

            let pointCtr = 0;
            let newdata = yearFilter(context.filter(function (d) {
                    if (d[2].toUpperCase().includes('URBANA'))
                        return pointCtr++ < 55000;
                    else
                        return true;
                }
            ), currentYear);

            scatterView.select('.scatBrush')
                .call(scatBrush)
                // set brush over full window
                .call(scatBrush.move, x1Scatter.range())
                .select('.selection')
                .style('fill','blue');



            x1Scatter.domain([new Date(currentYear, 0, 1, 0, 0, 0, 0), new Date(currentYear, 12, 1, 0, 0, 0, 0)]);
            x2Scatter.domain(x1Scatter.domain());
            y1Scatter.domain([0, d3.max(newdata, function (d) {
                return d[5]; // distance
            })]);
            y2Scatter.domain(y1Scatter.domain());

            scatterView.select('.x-axis').call(x1ScatterAxis);
            scatterView.select('.x2-axis').call(x2ScatterAxis);
            scatterView.select('.y-axis').call(yScatterAxis);

            dots.attr('clip-path', 'url(#clip2)');
            dots.selectAll('.dot')
                .data(newdata)
                .enter()
                .append('circle')
                .attr('class', 'dot')
                .attr('r', 2)
                .style('opacity', .5)
                .attr('cx', function(d) { return x1Scatter(d[4]); })
                .attr('cy', function(d) { return y1Scatter(d[5]); });

            ctxDots.selectAll('.ctxDot')
                .data(newdata)
                .enter()
                .append('circle')
                .attr('class', 'ctxDot')
                .attr('r', 1)
                .style('opacity', .5)
                .attr('cx', function(d) { return x2Scatter(d[4]); })
                .attr('cy', function(d) { return y2Scatter(d[5]); });
        }

        function scatterBrushed() {
            let selection = d3.event.selection;
            if (selection) {
                x1Scatter.domain(selection.map(x2Scatter.invert, x2Scatter));
                scatterView.selectAll('.dot')
                    .attr('cx', function (d) {
                        return x1Scatter(d[4]);
                    })
                    .attr('cy', function (d) {
                        return y1Scatter(d[5]);
                    });
                scatterView.select('.x-axis').call(x1ScatterAxis);
            }
        }



        function drawAgeView() {

            let ageRange = [5, 95];

            let threshold = d3.range(ageRange[0], ageRange[1], 1);

            x1Age.domain(ageRange);
            x2Age.domain(x1Age.domain());


            let histogram = d3.histogram()
                .domain(x1Age.domain())
                .thresholds(threshold)
                .value(function (d) {
                    return d[3]; // age
                });


            let bins = histogram(context);

            y1Age.domain([0, d3.max(bins, function (d) {
                return d.length;
            })]);



            y2Age.domain(y1Age.domain());

            ageView.select('.x-axis').call(x1AgeAxis);
            ageView.select('.x2-axis').call(x2AgeAxis);
            ageView.select('.y-axis').call(yAgeAxis);

            bars.attr('clip-path', 'url(#clip)');

            bars.selectAll('.bar')
                .data(bins, function (d) {
                    return d;
                })
                .enter()
                .append('rect')
                .attr('id', 'ageBar')
                .attr('class', 'bar')
                .attr('transform', function (d) {
                    return 'translate(' + (x1Age(d.x0) - 2) + ',' + (y1Age(d.length)) + ')';
                })
                .attr('width', function (d) {
                    return x1Age(d.x1) - x1Age(d.x0);
                })
                .attr('height', function(d) {
                    return rightViewHeight - y1Age(d.length) - 109;
                });



            ctxBars.selectAll('.ctxBar')
                .data(bins, function (d) {
                    return d;
                })
                .enter()
                .append('rect')
                .attr('id', 'ctxAgeBar')
                .attr('class', 'bar')
                .attr('transform', function (d) {
                    return 'translate(' + (x2Age(d.x0) - 2) + ',' + (y2Age(d.length)) + ')';
                })
                .attr('width', function (d) {
                    return x2Age(d.x1) - x2Age(d.x0);
                })
                .attr('height', function(d) {
                    return rightViewHeight - y2Age(d.length) - 40;
                });

            ageView.select('.ageBrush')
                .call(ageBrush)
                // set brush over full window
                .call(ageBrush.move, x1Age.range())
                .select('.selection')
                .style('fill','green');




        }

        function ageBrushed() {
            let selection2 = d3.event.selection;
            if (selection2) {
                x1Age.domain(selection2.map(x2Age.invert, x2Age));
                ageView.selectAll('#ageBar')
                    .attr('transform', (d) => {
                        return 'translate(' + (x1Age(d.x0) - 2) + ',' + y1Age(d.length) + ')';
                    });
                ageView.select('.x-axis').call(x1AgeAxis);
            }
        }

    });



}); // end d3.text
