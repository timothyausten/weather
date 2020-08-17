
// Data smoothing
// https://stackoverflow.com/questions/32788836/smoothing-out-values-of-an-array
function average(data) {
    var sum = data.reduce(function(sum, value) {
        return sum + value;
    }, 0);
    var avg = sum / data.length;
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

function pad(num, size) {
	// format with leading zeros
	// source https://stackoverflow.com/a/2998822
	var s = num+"";
	while (s.length < size) s = "0" + s;
	return s;
}



function plotlyChart(date, a, firstyear) {
	var x = [],
	y = [],
	z = [],
	i, j;

	// Assign year number to each item
	for (i=0; i<a.length; i++) {
		y[i] = [];
		for (j=0; j<a[i].length; j++) {
			y[i][j] = firstyear + i;
		}
	}

	// Assign record number to each item
	/*
	for (i=0; i<a.length; i++) {
		x[i] = [];
		for (j=0; j<a[i].length; j++) {
			x[i][j] = j;
		}
	} */

	// Convert iso dates to js dates
	for (i=0; i<date.length; i++) {
		x[i] = [];
		for (j=0; j<date[i].length; j++) {
			// The year 2000 is forced for each record. This gives summer months in the middle.
			// x[i][j] = '2000' + '-' + date[i][j].substr(5,2) + '-' + date[i][j].substr(8,2);
			// Only the month and date are taken. They are outputted as a four digit number. The chart is messed up.
			// x[i][j] = date[i][j].substr(5,2) + date[i][j].substr(8,2);
			// Just the key
			x[i][j] = j;
			// Combine key with month
			// x[i][j] = pad(j, 3) + date[i][j].substr(5,2);
		}
	}

	console.log(x);

	// Combine sub-arrays of record numbers into single array
	x = concatSubArrays(x);
	// x = concatSubArrays(x);
	// Combine sub-arrays of year numbers into single array
	y = concatSubArrays(y);
	// Combine sub-arrays of values into single array
	z = concatSubArrays(a);

	// Data smoothing
	// z = smooth(z, 16.00);

	data = [{
		x: x,
		y: y,
		z: z,
		type: 'contour'
	}];

	//Remove year from bottom tick labels
	// For example change "Jan 2000" to "Jan"
	// https://javascriptinfo.com/view/2815623/formatting-text-from-axis-ticks-in-plotly-using-tickformat
	Plotly.newPlot('contourchart', data);
	Plotly.d3.selectAll(".xtick text").each(function(d, i) {
		var label = Plotly.d3.select(this);
		label.html(label.html().substr(0, 3));
	});
	
}

