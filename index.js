/*global $,console,document*/
/* https://eslint.org/docs/user-guide/configuring */
/*eslint no-console: "off", no-unused-vars: "off"*/


var urlAndToken = {},
    urlParams = {},
	dateRange = {},
    listOfDates = [],
	dateStart,
	dateEnd,
	dateStartString,
	dateEndString,
	d = [],
	day,
	dateFormatted,
	temp = [],
	TempArray = [],
	urlOutput;

// document.getElementById('token')

urlAndToken = {
    url: 'https://www.ncdc.noaa.gov/cdo-web/api/v2/data?',
    token: 'uZXRsebTFuZXQayyYanptuRTghYsovlk',
}


dateRange = {
	start: {
		year: 2010,
		month: 5,
		day: 1
	}, end: {
		year: 2010,
		month: 5,
		day: 2
	}
}


// Subtract 1 from the input value for month because
// year and day numbering start at 1,
// but month numbering starts at 0. 
dateStart = new Date(dateRange.start.year, dateRange.start.month - 1, dateRange.start.day + 1);
dateEnd = new Date(dateRange.end.year, dateRange.end.month - 1, dateRange.end.day + 1);
dateStartString = dateStart.toISOString().substring(0, 10)
dateEndString = dateEnd.toISOString().substring(0, 10)
console.log(dateStartString);
console.log(dateEndString);



// Build a list of dates in ISO format
for (d = dateStart; d <= dateEnd; d.setDate(d.getDate() + 1)) {
    dateFormatted = d.toISOString().substring(0, 10);
	listOfDates.push(dateFormatted);
}
console.log(listOfDates);



urlParams.example = {
    datasetid: 'GSOM',
    stationid: 'GHCND:USC00010008',
    units: 'standard',
    startdate: '2010-05-01',
    enddate: '2010-05-31'
};
urlParams.orchards = {
    datasetid: 'GSOM',
    stationid: 'GHCND:US1WACK0003',
    units: 'standard',
    startdate: '2010-05-01',
    enddate: '2010-05-31'
};


function buildUrlOneDay(day) {
    // GSOM dataset (Global Summary of the Month) for GHCND station USC00010008, for May of 2010 with standard units
    var baseUrl, params, url;
    baseUrl = urlAndToken.url;
    params = urlParams.orchards;
	params.startdate = day;
	params.enddate = day;
    // Produces, for example, datasetid=GSOM&stationid=GHCND:USC00010008&units=standard&startdate=2010-05-01&enddate=2010-05-31
    params = $.param(params);
    url = baseUrl + params;
    return url;
}

function buildUrlRangeOfDays() {
    // GSOM dataset (Global Summary of the Month) for GHCND station USC00010008, for May of 2010 with standard units
    var baseUrl, params, url;
    baseUrl = urlAndToken.url;
    params = urlParams.orchards;
	params.startdate = dateStartString;
	params.enddate = dateEndString;
    // Produces, for example, datasetid=GSOM&stationid=GHCND:USC00010008&units=standard&startdate=2010-05-01&enddate=2010-05-31
    params = $.param(params);
    url = baseUrl + params;
    return url;
}
// console.log(buildUrlRangeOfDays());








/***********************
 * Output data to HTML *
 ***********************/

// Format and output temperature highs from within date range
function tempHighResponse(response, index) {
    var i, datatype, value, datatypesAndValues = {};
    var beautifiedJSON = JSON.stringify(response, null, 4);
    console.log(response);
    for (i=0;i<response.responseJSON.results.length;i++) {
        datatype = response.responseJSON.results[i].datatype;
        value = response.responseJSON.results[i].value;
        datatypesAndValues[datatype] = value;
	}
	temp = datatypesAndValues.EMXP;
	console.log('Hello World 2');
	console.log('Temperature: ' + temp);
	console.log('Index: ' + index);
	TempArray[index] = temp;
	console.log('Temerature list: ' + TempArray);
}

// Format and output weather data from AJAX response
function ajaxResponse(response) {
    var i, datatype, value, datatypesAndValues = {};
    var beautifiedJSON = JSON.stringify(response, null, 4);
    // console.log(response);
    for (i=0;i<response.responseJSON.results.length;i++) {
        datatype = response.responseJSON.results[i].datatype;
        value = response.responseJSON.results[i].value;
        datatypesAndValues[datatype] = value;
		temp = datatypesAndValues.EMXP;
    }
    $('#output2').html(JSON.stringify(datatypesAndValues, null, 4));
	console.log(datatypesAndValues);
	// Get just the temperature high for the day
	console.log(datatypesAndValues.EMXP);
}

// Format and output list of data types from AJAX response
function dataTypeResponse(response) {
    var i, datatype, value, datatypesAndValues = {};
    var beautifiedJSON = JSON.stringify(response, null, 4);
    // console.log(response);
    for (i=0;i<response.responseJSON.results.length;i++) {
        datatype = response.responseJSON.results[i].id;
        value = response.responseJSON.results[i].name;
        datatypesAndValues[datatype] = value;
    }
	$('#output3').html(JSON.stringify(datatypesAndValues, null, 4));
}



/********
 * AJAX *
 ********/


// get temperature highs


/*
// Test asynchronous behavior with for loops
for (var i = 1; i <= 10; i++) {
	(function(index) {
		setTimeout(function() { console.log(index); }, i*1000);
	})(i);
}
*/

/*
for (var i .....) {
  (function (i) {
    async(function() {
      use(i);
    });
  })(i);
}
*/

// $.each(linkList, function (i, item) {

function getHighs() {
		for (var n=0;n<listOfDates.length;n++) {
		(function(index) {
		// $.each(listOfDates, function(index, value) {
		// setTimeout(function() {
			day = listOfDates[index];
			console.log('Dates: ' + listOfDates);
			urlOutput = buildUrlOneDay(day);
			console.log(urlOutput);
				$.ajax({
					url: urlOutput,
					headers: {token: urlAndToken.token},
					complete: function (response) {
						tempHighResponse(response, index);
					},
					error: function (response) {
						tempHighResponse(response, index);
					}
				});
		 // }(), index*200);
		})(n);
}}
// $('#output').html(JSON.stringify(TempArray, null, 4));


// get data
function getData() {
	urlOutput = buildUrlRangeOfDays();
    $.ajax({
        url: urlOutput,
        headers: {token: urlAndToken.token},
        complete: function (response) {
            ajaxResponse(response);
        },
        error: function (response) {
            ajaxResponse(response);
        }
    });
}

// Get available data types
function getAvailableDataTypes() {
    var orchards = 'https://www.ncdc.noaa.gov/cdo-web/api/v2/datatypes?stationid=GHCND:US1WACK0003&startdate=1970-01-01&enddate=2100-12-31', everywhere = 'https://www.ncdc.noaa.gov/cdo-web/api/v2/datatypes?datasetid=GSOM&startdate=1970-01-01&enddate=2100-12-31';
    $.ajax({
        url: everywhere,
        headers: {
            token: urlAndToken.token,
        },
        complete: function (response) {
            dataTypeResponse(response);
        },
        error: function (response) {
            dataTypeResponse(response);
        }
    });
}




// Launch app
$(function () {
getHighs();
// getData();
// getAvailableDataTypes();
});



// JSON.stringify()
// JSON.parse(response.responseText)
// $('#output').html(responseString);
// var responseJSON = response.responseJSON;
// url: 'https://www.ncdc.noaa.gov/cdo-web/api/v2/datasets?stationid=GHCND:US1WACK0003',
