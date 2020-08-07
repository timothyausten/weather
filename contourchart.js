

function plotlyChart() {
	var x = [],
	y = [],
	z = [],
	data = [],
	date = [];
			
	for (i=0; i<multiTemp.datesAndValues.length; i++) {
		date = new Date(multiTemp.datesAndValues[i][0]);
		
		if (date.getMonth < 4) {
			date.setFullYear(date.getFullYear - 1);
		}
		
		x[i] = i; // Place temps in order by date
		y[i] = multiTemp.datesAndValues[i][0].substr(0,4); // Year
		z[i] = multiTemp.datesAndValues[i][1]; // Temperature
	}

	data = [{
		x: x,
		y: y,
		z: z,
		type: 'contour'
	}];

	Plotly.newPlot('tester', data);	
}
