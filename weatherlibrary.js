function concatSubArrays(arr) {
	// Combine sub-arrays into single array
	for (i=0; i<arr.length - 1; i++) {
		arr[0] = arr[0].concat(arr[i + 1]);
	}
	return arr[0];
}

function addDays(date, days) {
	// https://stackoverflow.com/a/19691491
	var result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}
