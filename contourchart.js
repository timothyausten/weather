
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
	var i, j,
	x = [],
	y = [],
	z = [];

	//Optional functions for x-axis

	function year2000() {
		// The year 2000 is forced for each record
		// Plotly interprets ISO date string as date and sorts dates in ascending order
		x[i] = '2000' + '-' + data[0][i].mmdd;
		console.log(x[i]);
	}
	function yearOne() {
		// Dates of first year
		// Plotly interprets ISO date string as date and sorts dates in ascending order
		x[i] = data[0][i].date;
	}
	function mmddNum() {
		// Only the month and date are taken. They are outputted as a four digit number. The chart is messed up.
		x[i] = data[0][i].date.substr(5,2) + data[0][i].date.substr(8,2) + '';
		x[i] = x[i]*1 // Convert to number
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
	for (i=0; i<data[0].length; i++) {
		key();
	}
	// Create y-axis labels (years)
	for (i=0; i<(dateRangeObj.end.year - dateRangeObj.start.year + 1); i++) {
		y[i] = dateRangeObj.start.year + i;
	}
	// Create 2D array of values for z
	for (i=0; i<data.length; i++) {
		z[i] = [];
		for (j=0; j<data[i].length; j++) {
			z[i][j] = data[i][j].value;
		}
	}

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

	$('#contourchart').empty(); // Clear chart before adding new chart
	$('#contourchartestimated').empty(); // Clear chart before adding new chart
	// document.getElementById('estimateform').style.display = 'inline';

	//Remove year from bottom tick labels
	// For example change "Jan 2000" to "Jan"
	// https://javascriptinfo.com/view/2815623/formatting-text-from-axis-ticks-in-plotly-using-tickformat
	Plotly.newPlot('contourchart', data);
	Plotly.newPlot('contourchartestimated', dataEstimated);
}

