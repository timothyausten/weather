function plotlyChart(a, firstyear) {
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
	for (i=0; i<a.length; i++) {
		x[i] = [];
		for (j=0; j<a[i].length; j++) {
			x[i][j] = j;
		}
	}

	console.log(a);
	// alert('Years: ' + y);

	function concatSubArrays(arr) {
		// Combine sub-arrays into single array
		for (i=0; i<arr.length - 1; i++) {
			arr[0] = arr[0].concat(arr[i + 1]);
		}
		return arr[0];
	}

	// Combine sub-arrays of record numbers into single array
	x = concatSubArrays(x);
	// Combine sub-arrays of year numbers into single array
	y = concatSubArrays(y);
	// Combine sub-arrays of values into single array
	z = concatSubArrays(a);


	console.log('x: ' + x);


	data = [{
		x: x,
		y: y,
		z: z,
		type: 'contour'
	}];

	Plotly.newPlot('contourchart', data);
}

