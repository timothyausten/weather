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

function pad(num, size) {
	https://stackoverflow.com/a/2998822
    var s = num + '';
    while (s.length < size) s = '0' + s;
    return s;
}


function mmddOld() {
	// Make an array of calendar days, without the year, in the format mm-dd
	var i;
	var daysOfYear = [];
	var daysOfYearOutput = [];
	var next = new Date('2020-01-01');
	for (i=0; i<366; i++) {
		daysOfYear[i] = new Date(next.setDate(next.getDate() + i));
		daysOfYear[i] = daysOfYear[i].toISOString().substring(5,10);
		daysOfYearOutput[i] = {};
		daysOfYearOutput[i].mmdd = daysOfYear[i];
	}
	return daysOfYearOutput;
}

function mmdd() {
	var i, j, day, arrayOut = [];
	var arrayIn = [31,29,31,30,31,30,31,31,30,31,30,31];
	for (i=0; i<12; i++) {
		for (j=0; j<arrayIn[i]; j++) {
			day = pad((i+1), 2) + '-' + pad((j+1), 2);
			arrayOut.push({mmdd: day});
		}
	}
	return arrayOut;
}

function objectToArray(obj) {
	var header, arr = [];
	header = Object.keys(obj[0]);
	arr[0] = header;
	for (i=1; i<obj.length - 1; i++) {
		arr[i] = Object.values(obj[i]);
	}
	return arr;
}

function sortByProperty(objArray, prop, direction){
	// Sort a JSON object by property
	// https://stackoverflow.com/q/4222690
    if (arguments.length<2) throw new Error("ARRAY, AND OBJECT PROPERTY MINIMUM ARGUMENTS, OPTIONAL DIRECTION");
    if (!Array.isArray(objArray)) throw new Error("FIRST ARGUMENT NOT AN ARRAY");
    const clone = objArray.slice(0);
    const direct = arguments.length>2 ? arguments[2] : 1; //Default to ascending
    const propPath = (prop.constructor===Array) ? prop : prop.split(".");
    clone.sort(function(a,b){
        for (let p in propPath){
                if (a[propPath[p]] && b[propPath[p]]){
                    a = a[propPath[p]];
                    b = b[propPath[p]];
                }
        }
        // convert numeric strings to integers
        a = a.match(/^\d+$/) ? +a : a;
        b = b.match(/^\d+$/) ? +b : b;
        return ( (a < b) ? -1*direct : ((a > b) ? 1*direct : 0) );
    });
    return clone;
}
// Access with:
// const resultsByObjectId = sortByProperty(results, 'attributes.OBJECTID');
// const resultsByObjectIdDescending = sortByProperty(results, 'attributes.OBJECTID', -1);
