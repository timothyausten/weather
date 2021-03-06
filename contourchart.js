
// Data smoothing
// https://stackoverflow.com/questions/32788836/smoothing-out-values-of-an-array
function average(datums) {
    var sum = datums.reduce(function(sum, value) {
        return sum + value;
    }, 0);
    var avg = sum / datums.length;
    return avg;
}
function smooth(values, alpha) {
    var weighted = average(values) * alpha;
    var smoothed = [];
    for (var i in values) {
        var curr = values[i];
        var prev = smoothed[i - 1] || values[values.length - 1];
        var next = curr || values[0];
        var improved = Number(this.average([weighted, prev, curr, next]).toFixed(2));
        smoothed.push(improved);
    }
    return smoothed;
}
// smooth(array, 0.85);

function plotlyChart(data, dateRangeObj) {
	var fahrenheit = [];
	var layout = {};
	var i, j,
	x = [],
	y = [],
	z = [];

	//Optional functions for x-axis

	function year2000() {
		// Dates artificially given as 1999-10-01 - 2000-09-30
		// Plotly can interpret ISO date string as date and sort dates in ascending order
		// This is OK except that Feb 29 is forced for each year and given a null value
		// if it isn't really a leap year so that each year is 366 days.
		var dayOne = new Date('1999-10-01');
		x[i] = addDays(dayOne, i)
	}
	function yearOne() {
		// Dates of first year
		// Plotly interprets ISO date string as date and sorts dates in ascending order
		x[i] = data[0][i].date;
	}
	function mmddNum() {
		// Only the month and date are taken. They are outputted as a four digit number. The chart is messed up.
		x[i] = data[0][i].date.substr(5,2) + data[0][i].date.substr(8,2) + '';
		x[i] = x[i]*1; // Convert to number
		console.log(x[i]);
	}
	function key() {
		// Just the key
		x[i] = i;
	}
	function keyAndMonth() {
		// Combine key with month
		x[i] = pad(i, 3) + data[0][i].date.substr(5,2);
	}
	function monthNum() {
		// Month as number
		x[i] = data[0][i].date.substr(5,2);
	}
	function mon() {
		// Month as Mmm
		var monthname = ['Dec', 'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct', 'Nov'];
		monNum = data[0][i].date.substr(5,2)*1;
		x[i] = monthname[monNum];
	}
	function monthNumber() {
		// Month as number
		x[i] = data[0][i].date.substr(5,2)*1;
		console.log(x[i]);
	}
	function monthWholeNumber() {
		// Month as whole number + day as fraction of month
		x[i] = data[0][i].date.substr(5,2)*1 + data[0][i].date.substr(8,2)/30;
		console.log(x[i]);
	}

	// End of optional functions for x-axis

	// Create x-axis labels
	//data[0].map(i => key());
	for (i=0; i<data[0].length; i++) {
		year2000();
	}



	// Create y-axis labels (years)
	for (i=0; i<(dateRangeObj.end.year - dateRangeObj.start.year + 1); i++) {
		y[i] = dateRangeObj.start.year + i;
	}

	// Create 2D array of values for z
	z = data.map(i => i.map(j => j.value));

	// Make a version of z in fahrenheit
	fahrenheit = z.map(i => i.map(j => j*9/5+32));
	// z = fahrenheit;

	// Data smoothing
	// z = smooth(z, 16.00);

	data = [{
		x: x,
		y: y,
		z: z,
		type: 'contour' /*heatmap*/,
		connectgaps: false
	}];
	dataEstimated = [{
		x: x,
		y: y,
		z: z,
		type: 'contour' /*heatmap*/,
		connectgaps: true
	}];

	// Force data from kauhajokidata.js
	// data = kauhajokiData;
	// dataEstimated = kauhajokiData;

	// For more time formatting types, see: https://github.com/d3/d3-time-format/blob/master/README.md
	layout = {
		title: '',
		xaxis: {
			/* tickformat: '%d %B (%a)\n %Y' */
			tickformat: '%b %e' /* Short month name and day of month */
		}
	};

	$('#contourchart').empty(); // Clear chart before adding new chart
	$('#contourchartestimated').empty(); // Clear chart before adding new chart
	// document.getElementById('estimateform').style.display = 'inline';

	//Remove year from bottom tick labels
	// For example change "Jan 2000" to "Jan"
	// https://javascriptinfo.com/view/2815623/formatting-text-from-axis-ticks-in-plotly-using-tickformat
	Plotly.newPlot('contourchart', data, layout);
	Plotly.newPlot('contourchartestimated', dataEstimated, layout);
	if (document.getElementById('fahrenheit').checked) { toFahrenheit(); };

	// Download data as text file
	function download(data) {
		var el = document.createElement('a');
		el.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 4)));
		el.setAttribute('download', 'weatherdata.txt');
	
		el.style.display = 'none';
		document.body.appendChild(el);
	
		el.click();
	
		document.body.removeChild(el);
	}
	//download(data);
	
}

