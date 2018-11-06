////////////////////////////////////////////////////////
//  code for working with original urbana_crimes.csv  //
////////////////////////////////////////////////////////

var context = [];

var strings = ['URBANA', 'CHICAGO', 'JACKSONVILLE', 'WASHINGTON', 'KANSAS CITY', 'NASHVILLE', 'ATLANTA', 'MINNEAPOLIS'];

d3.text('urbana_crimes.csv', function(error, data) {

    if (error) throw error;
    context = d3.csvParse(data, function (d) {


        // map data (location, city, type of crime)
        var point = d['ARRESTEE HOME CITY - MAPPED'].split(/[(]/).slice(1);
        if (point.length) {
            d.context = point.toString().match(/[+-]?\d+(?:\.\d+)?/g);
            d.context[0] = +d.context[0]; // latitude
            d.context[1] = +d.context[1]; // longitude
            d.context[2] = d['ARRESTEE HOME CITY']; // city
            d.context[3] = +d['AGE AT ARREST']; // age
            d.context[4] = d['DATE OF ARREST']; // year
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

        let changed = false;

        strings.forEach(function (s) {
            if (d[2].toUpperCase().includes(s)) {
                d[2] = s;
                changed = true;
            }
        });

        return changed;

    });

// store output
    var lineArray = [];
    context.forEach(function (p, i) {
        var line = p.join(",");
        lineArray.push(i === 0 ? 'LATITUDE,LONGITUDE,ARRESTEE HOME CITY,AGE AT ARREST,DATE OF ARREST,CRIME CODE DESCRIPTION\n' : line);
    });
    var csvContent = lineArray.join("\n");

    var blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, 'urbana_reduced2.csv');
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", 'urbana_reduced2.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

});