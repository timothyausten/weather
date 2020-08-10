/*global $,console,document*/
/* https://eslint.org/docs/user-guide/configuring */
/*eslint no-console: "off", no-unused-vars: "off"*/


var urlAndToken = {},
    urlParams = {},
	dateRangeInput = {},
	dateRangeTest = {},
	dateRange = {},
	dateStart = [],
	dateEnd = [],
	d = [],
	n,
	day,
	dateFormatted,
	temp = [],
	TempArray = [],
	urlOutput,
	singleTemperature = [],
	multiyearValues = [],
	multiTemp = {},
	locations = {},
	stations = {},
	JSON2HtmlTableValues = '<table>',
	JSON2HtmlTableDates = '<table>',
	compiledData = {};

	compiledData.date = [];
	compiledData.value = [];





// document.getElementById('token')

urlAndToken = {
    url: 'https://www.ncdc.noaa.gov/cdo-web/api/v2/data?',
    token: 'uZXRsebTFuZXQayyYanptuRTghYsovlk',
}


dateRangeInput = {
	start: {
		year: 2008,
		month: 3,
		day: 1
	}, end: {
		year: 2009,
		month: 3,
		day: 31
	}
}



function dateRangeConstructor(year) {
    // Subtract 1 from the input value for month because
    // year and day numbering start at 1,
    // but month numbering starts at 0. 
	var start = new Date(year, dateRangeInput.start.month - 1, dateRangeInput.start.day + 1);
	var end = new Date(year + 1, dateRangeInput.start.month - 1, dateRangeInput.start.day);
	this.start = start;
	this.end = end;
	this.startString = start.toISOString().substring(0, 10);
	this.endString = end.toISOString().substring(0, 10);
}

// dateRangeTest = new dateRangeConstructor(2015);
// console.log('start: ' + dateRangeTest.startString);
// console.log('end: ' + dateRangeTest.endString);

// dateEndString = dateEnd.toISOString().substring(0, 10)

function listOfDates() {
	// Build a list of dates in ISO format
	var list;
	var dateRange = new dateRangeConstructor(year);
	for (d = dateRange.start; d <= dateRange.end; d.setDate(d.getDate() + 1)) {
		dateFormatted = d.toISOString().substring(0, 10);
		list.push(dateFormatted);
	}
	return list;
}

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

locations = {
	kauhajoki:  'GHCND:FIE00143471',
	vaasa:      'GHCND:FIE00144212',
	pdx:        'GHCND:USW00024229',
	ncarolina:  'ZIP:28801', /*somewhere in n. carolina*/
	ncarolina2: 'FIPS:37', /*north carolina, throws errors for some reason*/
}

stations = {
   'orchards': 'GHCND:USC00010008',
}


urlParams.example = {
    datasetid: 'GSOM',
	locationid: 'FIPS:37',
    units: 'standard',
    startdate: '2010-05-01',
    enddate: '2010-05-31'
};
urlParams.maxTempAtLocation = {
    datasetid: 'GHCND',
	stationid: locations.kauhajoki,
    units: 'metric',
    startdate: '2010-01-01',
    enddate: '2010-03-01',
	limit: 1000,
	datatypeid: 'TMAX'
};

function buildUrlOneDay(date) {
    // GSOM dataset (Global Summary of the Month) for GHCND station USC00010008, for May of 2010 with standard units
    var baseUrl, params, url;
    baseUrl = urlAndToken.url;
    params = urlParams.maxTempAtLocation;
	params.startdate = date;
	params.enddate = date;
    // Produces, for example, datasetid=GSOM&stationid=GHCND:USC00010008&units=standard&startdate=2010-05-01&enddate=2010-05-31
    params = $.param(params);
    url = baseUrl + params;
    return url;
}

function buildUrlRangeOfDays(year) {
    // GSOM dataset (Global Summary of the Month) for GHCND station USC00010008, for May of 2010 with standard units
    var baseUrl, params, url;
	var d = [];
    baseUrl = urlAndToken.url;
    params = urlParams.maxTempAtLocation;
	d = new dateRangeConstructor(year);
	params.startdate = d.startString;
	params.enddate = d.endString;
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
function getHighsResponse(response, row, compiledData) {
	var i, winter, date, value;
	multiTemp = new WeatherResponse(response);

	compiledData.date[row] = [];
	compiledData.value[row] = [];
// Create block of html data
	for (i=0;i<multiTemp.datesAndValues.length;i++) {
		// dateRangeInput.start.year = year + j;
		// dateRangeInput.end.year = year + j + 1;
		winter = multiTemp.datesAndValues[0][0].substr(0,4);
		date = multiTemp.datesAndValues[i][0];
		value = multiTemp.datesAndValues[i][1];
		compiledData.date[row][i] = date;
		compiledData.value[row][i] = value;
        // JSON2HtmlTable = JSON2HtmlTable + '<tr><td>' + date + '<td>' + value + '</tr>';
	}
	console.log(compiledData.value[row].toString());
	// JSON2HtmlTable = JSON2HtmlTable + '</table>';	
  	// $('#output').html('Daily temperature highs:<br>' + JSON2HtmlTableValues);
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
	var date, urlOutput;
	date = listOfDates()[day];
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
	var DayNumber, date, urlOutput;
	DayNumber = day;
	date = listOfDates()[day];
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

function getHighsJustOne(day) {
	var date, urlOutput;
	date = listOfDates()[day];
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
    var urlOutput;
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
function getHighsAgain(year, row, compiledData) {
	var urlOutput;
	urlOutput = buildUrlRangeOfDays(year);
    $.ajax({
        url: urlOutput,
        headers: {token: urlAndToken.token},
        complete: function (response) {
			getHighsResponse(response, row, compiledData);
        },
        error: function (response) {
			compiledData = getHighsResponse(response, row, compiledData);
        }
	});
}
// get data
function getHighs(year, row, compiledData) {
	var urlOutput;
	urlOutput = buildUrlRangeOfDays(year);
    $.ajax({
        url: urlOutput,
        headers: {token: urlAndToken.token},
        complete: function (response) {
			getHighsResponse(response, row, compiledData);
			year++;
			row++;
			getHighsAgain(year, row, compiledData);
        },
        error: function (response) {
			compiledData = getHighsResponse(response, row, compiledData);
        }
	});
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

// This is a test to see how global variables are affected
// when they are modified from inside jquery functions
var helloworld = [0];
$(function () {
	helloworld[1] = 1;
	helloworld[2] = 2;
	console.log('inside: ' + helloworld);
});
console.log('outside: ' + helloworld);

// Launch app
$(function () {


/*
$.each(listOfDates(), function(index, value) {
	setTimeout(function() {
		date(index);
	}, index*400);
});
*/

// getData();4
// getAvailableDataTypes();

/* 
getHighs(2008, 0);
window.setTimeout(function () { getHighs(2009, 1); },  10000);
window.setTimeout(function () { getHighs(2010, 2); },  20000);
window.setTimeout(function () { getHighs(2011, 3); },  30000);
window.setTimeout(function () { getHighs(2012, 4); },  40000);
window.setTimeout(function () { getHighs(2013, 5); },  50000);
window.setTimeout(function () { getHighs(2014, 6); },  60000);
window.setTimeout(function () { getHighs(2015, 7); },  70000);
window.setTimeout(function () { getHighs(2016, 8); },  80000);
window.setTimeout(function () { getHighs(2017, 9); },  90000);
window.setTimeout(function () { getHighs(2018, 10); }, 100000);
window.setTimeout(function () { getHighs(2019, 11); }, 110000);
window.setTimeout(function () { plotlyChart();   }, 120000);
window.setTimeout(function () { plotlyChartTest(); }, 120000);
window.setTimeout(function () { 
	var table = arrayToTable(compiledData.value, {
		thead: false,
		attrs: {class: 'table'}
	})
	$('#output').append(table);
}, 130000);
 */

function y2008() {
	getHighs(2008, 0, compiledData);
}
y2008();


plotlyChartTest();


});






// JSON.stringify()
// JSON.parse(response.responseText)
// $('#output').html(responseString);
// var responseJSON = response.responseJSON;
// url: 'https://www.ncdc.noaa.gov/cdo-web/api/v2/datasets?stationid=GHCND:US1WACK0003',