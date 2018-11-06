var context = [];
var parseDate = d3.timeParse('%m/%d/%Y');

var svgHeight = 600;
var svgWidth = 950;
var popupHeight = 200;
var popupWidth = 300;
var svgBottomWidth = svgWidth + svgWidth / 2 + 10;
var svgBottomHeight = svgHeight / 7;
var histopadding = 10;
var cities;

var body = d3.select('body')
    .append('div')
    .style('width', 3 * svgWidth / 2 + 80 + 'px')
    .style('height', 1.12 * svgHeight + 30 + 'px')
    .style('overflow', 'hidden');

var svg = body
    .append('div')
    .style('width', svgWidth + 10 + 'px')
    .style('height', svgHeight + 10 + 'px')
    .style('float', 'left')
    .style('padding-left', 10 + 'px')
    .style('padding-top', 5 + 'px')
    .append('svg')
    .attr('height', svgHeight)
    .attr('width', svgWidth)
    .attr('class', 'map');

// setup barView
var barView = body
    .append('div')
    .style('margin-top', 5 + 'px')
    .append('svg')
    .attr('id', 'barView')
    .attr('class', 'view')
    .attr('height', svgHeight / 2 - 5)
    .attr('width', svgWidth / 2)
    .style('outline', 'thin solid black');

var scatterViewWidth =  svgWidth / 2;
var scatterViewHeight =  svgHeight / 2 - 5;

var scatterView = body
    .append('div')
    .style('margin-top' , 5 + 'px')
    .append('svg')
    .attr('id', 'scatterView')
    .attr('class', 'view')
    .attr('height', scatterViewHeight)
    .attr('width', scatterViewWidth)
    .style('outline', 'thin solid black');

var xScatter = d3.scaleTime().range([10, scatterViewWidth - 10]);
var yScatter = d3.scaleLinear().range([scatterViewHeight - 10 , 10]);

var svgBottom = body
    .append('div')
    .style('padding-left', 10 + 'px')
    .append('svg')
    .attr('height', svgBottomHeight)
    .attr('width', svgBottomWidth)
    .style('outline', 'thin solid black')
    .attr('class', 'view');

var brush = d3.brushX()
    .extent([[0, 0], [svgWidth + svgWidth / 2, svgHeight/15]]);
    // .on("end", brushed);

var distanceView = svgBottom.append("g")
    .attr('class', 'distanceView')
    .attr('transform', 'translate(' + 5 + "," + 5 + ')');


distanceView.append('g')
    .attr('class', 'brush')
    // apply brushing to this group
    .call(brush)
    // set brush over full window
    .call(brush.move, [0,svgBottomWidth - 10])
    .select('.selection')
    .style('fill','green');


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
        .attr('transform', 'translate(' + 70 + ',' + (svgHeight - 30) + ')')
        .text('(miles)', 'sans-serif');
});

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

                    tooltip.html('click to unpin or drag a selection frame over pinned cities for multi unpinning')
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
            drawScatterView();
            popup = d3.select('svg')
                .append('g')
                .attr('id', 'popup')
                .append('svg')
                .attr('id', 'popupWindow')
                .attr('x', svgWidth - popupWidth - 80)
                .attr('y', svgHeight - popupHeight - 120);

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
                .attr("transform", "rotate(-90)")
                .attr('x', -((popupHeight) / 2) )
                .attr('y', 2*histopadding - 3)
                .style('text-anchor', 'middle')
                .text('Population');


            popup.selectAll('#popupBar')
                .data(bins, function (d) {
                    return d;
                })
                .enter()
                .append('rect')
                .attr('id', 'popupBar')
                .attr('class', 'bar')
                .attr('transform', function (d) {
                    return "translate(" + (xh(d.x0) + 5 * histopadding) + "," + (yh(d.length)) + ")";
                })
                .attr('width', function (d) {
                    return xh(d.x1) - xh(d.x0);
                });

            var slider = d3.select('#popupWindow').append('g')
                .attr('id', 'slider')
                .attr('transform', 'translate(' + 20 +', ' + (popupHeight + 40) + ')');
            // .attr('transform', 'translate(' + 30 +', ' + (svgHeight * .92) + ')');

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
                        drawScatterView();
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
                dots.selectAll('.dot').remove();
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
                        return "translate(" + (xh(d.x0) + 5 * histopadding) + "," + yh(d.length) + ")";
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

        function updateTable(data) {

            let update = barView.selectAll('#gangsterdata')
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
                    return d.city + ' : ' + d.counter;
                });

            update.text(function (d) {
                return d.city + ' : ' + d.counter;
            });

            update.exit()
                .remove();

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

        var dots = scatterView.append('g')
            .attr('id', 'scatterDots');
        ///////////////////
        //  scatterplot  //
        ///////////////////
        function drawScatterView() {

            dots.selectAll('.dot').remove();
            let pointCtr = 0;
            let newdata = yearFilter(context.filter(function (d) {
                    if (d[2].toUpperCase().includes("URBANA"))
                        return pointCtr++ < 55000;
                    else
                        return true;
                }
            ), currentYear);

            xScatter.domain(d3.extent(newdata, function (d) {
                return d[4];
            }));

            yScatter.domain([0, d3.max(newdata, function (d) {
                return d[5]; // distance
            })]);


            dots.attr('clip-path', 'url(#clip)');
            dots.selectAll('.dot')
                .data(newdata)
                .enter()
                .append('circle')
                .attr('class', 'dot')
                .attr('r',2)
                .style('opacity', .5)
                .attr('cx', function(d) { return xScatter(d[4]); })
                .attr('cy', function(d) { return yScatter(d[5]); });

        }

    });



}); // end d3.text
