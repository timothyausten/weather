

function plotlyChart(a, firstyear) {
	var x = [],
	y = [],
	z = [],
	i, j,
	accum = 0, // accumulated number of records
	data = [],
	recordNum = [],
	recordYear = [];

	for(i=0; i<a.length; i++) {
		recordNum[i] = [];
		recordYear[i] = [];
		console.log('accum: ' + accum)
		for(j=0; j<a[i].length; j++) {
			// Assign record number to each value
			recordNum[i][j] = accum + j;
			recordYear[i][j] = firstyear + i;
		}
		// Combine array elements into single array
		accum = accum + a[i].length;
		x = recordNum[i].concat(recordNum[i + 1]);
		y = recordYear[i].concat(recordYear[i + 1]);
	}

	console.log('x: ' + x);

	for(i=0;i<a.length;i++) {
		z = a[i].concat(a[i + 1]);
	}

	data = [{
		x: x,
		y: y,
		z: z,
		type: 'contour'
	}];

	Plotly.newPlot('contourchart', data);	
}
