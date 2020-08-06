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
	n,
	day,
	dateFormatted,
	temp = [],
	TempArray = [],
	urlOutput,
	singleTemperature = [],
	multiyearValues = [];


// document.getElementById('token')

urlAndToken = {
    url: 'https://www.ncdc.noaa.gov/cdo-web/api/v2/data?',
    token: 'uZXRsebTFuZXQayyYanptuRTghYsovlk',
}


dateRange = {
	start: {
		year: 2008,
		month: 11,
		day: 1
	}, end: {
		year: 2009,
		month: 3,
		day: 31
	}
}



// Subtract 1 from the input value for month because
// year and day numbering start at 1,
// but month numbering starts at 0. 
dateStart = new Date(dateRange.start.year, dateRange.start.month - 1, dateRange.start.day + 1);
dateEnd = new Date(dateRange.end.year, dateRange.end.month - 1, dateRange.end.day + 1);
dateStartString = dateStart.toISOString().substring(0, 10)
dateEndString = dateEnd.toISOString().substring(0, 10)

// Build a list of dates in ISO format
for (d = dateStart; d <= dateEnd; d.setDate(d.getDate() + 1)) {
    dateFormatted = d.toISOString().substring(0, 10);
	listOfDates.push(dateFormatted);
}


urlParams.example = {
    datasetid: 'GSOM',
	locationid: 'FIPS:37',
    units: 'standard',
    startdate: '2010-05-01',
    enddate: '2010-05-31'
};
urlParams.orchards = {
    datasetid: 'GHCND',
	stationid: 'GHCND:FIE00143471',
    units: 'metric',
    startdate: '2010-01-01',
    enddate: '2010-03-01',
	limit: 1000,
	datatypeid: 'TMAX'
};

// locationid: 'GHCND:FIE00143471' (kauhajoki)
// locationid: 'GHCND:FIE00144212' (vaasa)
// locationid: 'GHCND:USW00024229' (pdx)
// locationid: 'ZIP:28801' (somewhere in north carolina)
// locationid: 'FIPS:37' (north carolina) throws errors for some reason
// stationid: 'GHCND:USC00010008' (orchards),



/*
Available datasets
    "GHCND": "Daily Summaries",
    "GSOM": "Global Summary of the Month",
    "GSOY": "Global Summary of the Year",
    "NEXRAD2": "Weather Radar (Level II)",
    "NEXRAD3": "Weather Radar (Level III)",
    "NORMAL_ANN": "Normals Annual/Seasonal",
    "NORMAL_DLY": "Normals Daily",
    "NORMAL_HLY": "Normals Hourly",
    "NORMAL_MLY": "Normals Monthly",
    "PRECIP_15": "Precipitation 15 Minute",
    "PRECIP_HLY": "Precipitation Hourly"
*/

function buildUrlOneDay(date) {
    // GSOM dataset (Global Summary of the Month) for GHCND station USC00010008, for May of 2010 with standard units
    var baseUrl, params, url;
    baseUrl = urlAndToken.url;
    params = urlParams.orchards;
	params.startdate = date;
	params.enddate = date;
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

function WeatherResponse(response) {
    var i, datatype, value, measurement, description, date, value;
    var beautifiedJSON = JSON.stringify(response, null, 4);
    // console.log(response);
	this.datatypesAndValues = {};
	this.measurementsAndDescriptions = {};
	this.datesAndValues = [];
    for (i=0;i<response.responseJSON.results.length;i++) {
		// For when the response contains information about stations, locations, and datatypes
        datatype = response.responseJSON.results[i].datatype;
        value = response.responseJSON.results[i].value;
        this.datatypesAndValues[datatype] = value;
		
		// For when the response contains single values for a date range
		// and not an array of values for multiple days
		measurement = response.responseJSON.results[i].id;
        description = response.responseJSON.results[i].name;
        this.measurementsAndDescriptions[measurement] = description;

		// For when the results contain an array of dates and temperatures
		date = response.responseJSON.results[i].date;
		date = date.substring(0, 10);
		value = response.responseJSON.results[i].value;
		this.datesAndValues.push([date, value]);
	}
}







	
/***********************
 * Output data to HTML *
 ***********************/
 
function tempHighResponse0(response, DayNumber) {
	singleTemperature[DayNumber] = new WeatherResponse(response);
	temp = singleTemperature[DayNumber].datatypesAndValues.TMAX;
	console.log('Hello World 2');
	console.log('Temperature: ' + temp);
	console.log('Index: ' + DayNumber);
	TempArray[DayNumber] = temp;
	console.log('Temerature list: ' + TempArray);
    $('#output').html('List of temperatures:<br>' + TempArray.toString());
}
 
function tempHighResponse1(response, day) {
	singleTemperature[day] = new WeatherResponse(response);
	temp = singleTemperature[day].datatypesAndValues.TMAX;
	TempArray[day] = temp;
    $('#output').html('List of temperatures:<br>' + JSON.stringify(TempArray, null, 4));
}
 
// Format and output temperature highs from within date range
function tempHighResponseOld(response, index) {
    var i, datatype, value, datatypesAndValues = {};
    var beautifiedJSON = JSON.stringify(response, null, 4);
    console.log(response);
    for (i=0;i<response.responseJSON.results.length;i++) {
        datatype = response.responseJSON.results[i].datatype;
        value = response.responseJSON.results[i].value;
        datatypesAndValues[datatype] = value;
	}
	temp = datatypesAndValues.TMAX;
	TempArray[index] = temp;
}

// Format and output weather data from AJAX response
function ajaxResponse(response) {
	var multiTemp = new WeatherResponse(response);
    $('#output2').html(JSON.stringify(multiTemp.datatypesAndValues, null, 4));
    console.log('multiTemp: ');
	console.log(multiTemp);
	// Get just the temperature high for the day
	console.log(multiTemp.datatypesAndValues.TMAX);
}

// bookmark
function getHighsNoLoopResponse(response, year, j) {
	var date, value, JSON2TextTable = '';
	var multiTemp = new WeatherResponse(response);
	// console.log(multiTemp);
	
	for (i=0;i<multiTemp.datesAndValues.length;i++) {
		dateRange.start.year = year + j;
		dateRange.end.year = year + j + 1;
		date = multiTemp.datesAndValues[i][0];
		value = multiTemp.datesAndValues[i][1];
		multiyearValues[i] = [];
		multiyearValues[i][j] = value;
        JSON2TextTable = JSON2TextTable + date + '&nbsp;&nbsp;&nbsp;&nbsp;' + value + '<br>';
	}
	console.log(dateRange.end.year);
    console.log(multiyearValues[0][0] + ',' + multiyearValues[0][1] + ',' + multiyearValues[0][2]);
  	$('#output').html('Daily temperature highs:<br>' + JSON2TextTable);	
}


	
	
	
	
	
	
// Format and output list of data types from AJAX response
function dataTypeResponse(response) {
	var allMetaData = new WeatherResponse(response);
	$('#output3').html(JSON.stringify(allMetaData.measurementsAndDescriptions, null, 4));
	console.log('Meta data: ');
	console.log(allMetaData);
}

/********
 * AJAX *
 ********/ 


// get temperature highs


function getHighs0(day) {
	date = listOfDates[day];
	console.log('Date: ' + date);
	console.log('DayNumber: ' + day);
	console.log('Date: ' + date);
	urlOutput = buildUrlOneDay(date);
	console.log(urlOutput);
	console.log('Index at AJAX call: ' + day);
	$.ajax({
		url: urlOutput,
		headers: {token: urlAndToken.token},
		complete: function (response) {
			tempHighResponse0(response, day);
		},
		error: function (response) {
			tempHighResponse0(response, day);
		}
	});
}

function getHighs1(day) {
	var DayNumber = day;
	date = listOfDates[day];
	console.log('Date: ' + date);
	console.log('DayNumber: ' + day);
	urlOutput = buildUrlOneDay(date);
	$.ajax({
		url: urlOutput,
		headers: {token: urlAndToken.token},
		complete: function (response) {
			tempHighResponse1(response, day);
		},
		error: function (response) {
			tempHighResponse1(response, day);
		}
	});
}

function getHighs(day) {
	date = listOfDates[day];
	console.log('Date: ' + date);
	console.log('DayNumber: ' + day);
	console.log('Date: ' + date);
	urlOutput = buildUrlOneDay(date);
	console.log(urlOutput);
	console.log('Index at AJAX call: ' + day);
	$.ajax({
		url: urlOutput,
		headers: {token: urlAndToken.token},
		complete: function (response) {
			tempHighResponse0(response, day);
		},
		error: function (response) {
			tempHighResponse0(response, day);
		}
	});
}


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

// get data
function getHighsNoLoop(year, j) {
	urlOutput = buildUrlRangeOfDays();
    $.ajax({
        url: urlOutput,
        headers: {token: urlAndToken.token},
        complete: function (response) {
            getHighsNoLoopResponse(response, year, j);
        },
        error: function (response) {
            getHighsNoLoopResponse(response, year, j);
        }
    });
}

//bookmark
function multiYear(year) {
	var j;
	for (j=0;j<=3;j++) {
		// console.log(dateRange.end.year);
		getHighsNoLoop(year, j);
	}
}


// Get available data types
function getAvailableDataTypes() {
    var orchards = 'https://www.ncdc.noaa.gov/cdo-web/api/v2/datatypes?stationid=GHCND:US1WACK0003&startdate=1970-01-01&enddate=2100-12-31',
	everywhereGSOM = 'https://www.ncdc.noaa.gov/cdo-web/api/v2/datatypes?datasetid=GSOM',
	everywhereGHCND = 'https://www.ncdc.noaa.gov/cdo-web/api/v2/datatypes?datasetid=GHCND',
	dataSetsWithTemp = 'https://www.ncdc.noaa.gov/cdo-web/api/v2/datasets?datatypeid=LTMN',
	dataSetsAll = 'https://www.ncdc.noaa.gov/cdo-web/api/v2/datasets'
	tmax = 'https://www.ncdc.noaa.gov/cdo-web/api/v2/datatypes/TMAX',
	dataTypesTemp = 'https://www.ncdc.noaa.gov/cdo-web/api/v2/datatypes?datacategoryid=TEMP&limit=200';


response = requests.get(url, headers = headers)
	
	// HTMX LTMN TMAX TMIN
	// NORMAL_DLY
    $.ajax({
        url: dataTypesTemp,
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

/*
$.each(listOfDates, function(index, value) {
	setTimeout(function() {
		getHighs(index);
	}, index*400);
});
*/

multiYear(2008);
// getData();4
// getAvailableDataTypes();
});



// JSON.stringify()
// JSON.parse(response.responseText)
// $('#output').html(responseString);
// var responseJSON = response.responseJSON;
// url: 'https://www.ncdc.noaa.gov/cdo-web/api/v2/datasets?stationid=GHCND:US1WACK0003',