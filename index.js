/*global $,console,document*/
/* https://eslint.org/docs/user-guide/configuring */
/*eslint no-console: "off", no-unused-vars: "off"*/


var urlAndToken = {},
    urlParams = {},
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
	locations = {},
	stations = {},
	boundingboxes = {},
	JSON2HtmlTableValues = '<table>',
	JSON2HtmlTableDates = '<table>',
	compiledData = [];

// document.getElementById('token')

urlAndToken = {
	url: 'https://www.ncdc.noaa.gov/cdo-web/api/v2/data?',
    token: 'uZXRsebTFuZXQayyYanptuRTghYsovlk'
};

function dateRangeConstructor(year, dateRangeObj) {
    // Subtract 1 from the input value for month because
    // year and day numbering start at 1,
	// but month numbering starts at 0.
	var startDate = new Date(year, dateRangeObj.start.month - 1, dateRangeObj.start.day + 1);
	var endDate = new Date(year + 1, dateRangeObj.start.month - 1, dateRangeObj.start.day);
	this.startDate = startDate;
	this.endDate = endDate;
	this.startString = startDate.toISOString().substring(0, 10);
	this.endString = endDate.toISOString().substring(0, 10);
	console.log(this.endString);
	this.start = {};
	this.end = {};
	this.end.month = this.endString.substring(6,7);
	this.end.day = this.endString.substring(9,10);
}

// dateRangeTest = new dateRangeConstructor(2015);
// console.log('start: ' + dateRangeTest.startString);
// console.log('end: ' + dateRangeTest.endString);

// dateEndString = dateEnd.toISOString().substring(0, 10)

function listOfDates() {
	// Build a list of dates in ISO format
	var list;
	var dateRange = new dateRangeConstructor(year, dateRangeObj);
	for (d = dateRange.startDate; d <= dateRange.endDate; d.setDate(d.getDate() + 1)) {
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
	pdx:           'GHCND:USW00024229',
	ncarolinazip:  'ZIP:28801', /*somewhere in n. carolina*/
	ncarolina:     'FIPS:37', /*north carolina, throws errors for some reason*/
};
stations = {
   orchards:   'GHCND:USC00010008',
   kauhajoki:  'GHCND:FIE00143471',
   vaasa:      'GHCND:FIE00144212',
   seinäjoki:  'GHCND:FIE00144322',
   ilomantsi:  'GHCND:FIE00145052'

};
boundingboxes = {
	laihia:'62.7,21.8,63,22.7',
	bellevue: '47.5204,-122.2047,47.6139,-122.1065',
	vaasa: '21.12,62.91,22.14,63.29',
};
dataSetId = {
	gsom: 'GSOM',  /* Global Summary of the Month */
	ghcnd: 'GHCND',  /* Global daily summaries works with kauhajoki */
};


urlParams.example = {
    datasetid: 'GSOM',
	locationid: 'FIPS:37',
    units: 'standard',
    startdate: '2010-05-01',
    enddate: '2010-05-31'
};
urlParams.custom = {
    datasetid: 'GSOM',
	locationid: 'FIPS:37',
    units: 'standard',
    startdate: '2010-05-01',
    enddate: '2010-05-31'
};
urlParams.maxTempAtLocation = {
	datasetid: dataSetId.ghcnd,
	stationid: stations.kauhajoki,
	/* locationid: locations.ncarolina, */
    units: 'metric',
    startdate: '2010-01-01',
    enddate: '2010-03-01',
	limit: 1000,
	datatypeid: 'TMAX'
};

function buildUrlCustom(webpage, params) {
    // Produces url with whatever parameters you want
    var baseUrl, params, url;
	baseUrl = 'https://www.ncdc.noaa.gov/cdo-web/api/v2/';
    params = $.param(params);
    url = baseUrl + webpage + '?' + params;
    return url;
}

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

function buildUrlRangeOfDays(year, dateRangeObj, station) {
    // GHCND dataset (Global daily summaries) for GHCND station USC00010008, for May of 2010 with standard units
    // Produces, for example, datasetid=GSOM&stationid=GHCND:USC00010008&units=standard&startdate=2010-05-01&enddate=2010-05-31
    var baseUrl, params, url;
	var d;
    baseUrl = urlAndToken.url;
	params = urlParams.maxTempAtLocation;
	d = new dateRangeConstructor(year, dateRangeObj);
	params.stationid = station;
	params.startdate = d.startString;
	params.enddate = d.endString;
    params = $.param(params);
    url = baseUrl + params;
    return url;
}

function WeatherResponse(response, dateRangeObj, year) {
	var i, datatype, value, measurement, description, date, value, alasqlResponse;
	var daysOfYearSQL, sqlOuterJoin;
	var beautifiedJSON = JSON.stringify(response, null, 4);
	var sqlStatement;
	var daysOfYearJSON;

	response = response.responseJSON.results;

	// Make an array of calendar days in the format mm-dd
	daysOfYearJSON = mmdd();
	// daysOfYearJSON = sortByProperty(daysOfYearJSON, 'mmdd');

	// console.table(daysOfYearJSON);

	(function() {
		// build full date from year plus mm-dd
		var mmdd, currentDate;
		var lastDayInFiscalYear =
			dateRangeObj.end.month + 
			pad(dateRangeObj.end.day, 2);
			lastDayInFiscalYear = lastDayInFiscalYear*1; // Convert string to number
		for (i=0; i<daysOfYearJSON.length; i++) {
			mmdd = daysOfYearJSON[i].mmdd;
			mmddAsNumber = mmdd.substring(0,2) + '' + pad(mmdd.substring(3,5), 2);
			mmddAsNumber = mmddAsNumber*1; // Convert string to number
			currentYearDate = new Date (dateRangeObj.start.year + '-' + mmdd);
			if (mmddAsNumber <= lastDayInFiscalYear) {
				daysOfYearJSON[i].date = (year+1) + '-' + mmdd
			} else {
				daysOfYearJSON[i].date = (year) + '-' + mmdd
			}
			daysOfYearJSON[i].winter = year;
		}
	}());

	for (i=0; i<response.length; i++) {
		// Truncate date to 10 characters in format yyyy-mm-dd
		response[i].date = response[i].date.substring(0,10);
		// Add column for mm-dd
		response[i].mmdd = response[i].date.substring(5,10);
		// Add column for winter year
		response[i].winter = year;
	}

	function outerjoin(a, b) {	
		// a has all values in list, b has some values in list.
		// Add records from a to b that b is missing
		var found = false;
		for (i=0; i<a.length; i++) {
			// a[i] is the needle
			for (j=0; j<b.length; j++) {
				if (a[i].mmdd === b[j].mmdd) {
					found = true;
				}
			}
			if (!found) {
				b.push(a[i]);
			}
			found = false;
		}
		return b;
	}
	response = outerjoin(daysOfYearJSON, response);
	response = sortByProperty(response, 'date');

	// console.table(response);

	// See example of how to import json into table
	// https://github.com/agershun/alasql/blob/develop/examples/nodesample.js

	/* var db = new alasql.Database();
	db.exec('CREATE TABLE calendar');
	db.exec('CREATE TABLE response');
	db.tables.calendar.data = daysOfYearJSON;
	db.tables.response.data = response; */

	// db.exec('ALTER TABLE calendar MODIFY COLUMN [mmdd] STRING');
	// db.exec('ALTER TABLE response MODIFY COLUMN mmdd STRING');

/* 	sqlOuterJoin = db.exec(
		'SELECT * ' +
		'FROM response ' +
		'OUTER JOIN calendar ' +
		'ON response.mmdd=calendar.mmdd ' +
		'ORDER BY mmdd'
	);
	console.table(sqlOuterJoin); */
	// sqlbookmark

	// I shall find a way to combine tables from two different JSON objects
	// into one database and combine them.

	// If column name is sql keyword, then wrap it in brackets, like [value]
	// If there is only one table in the JSON object and it has no name, then use "FROM ? AS t"
/* 	sqlStatement = 'SELECT ' +
		'date, ' +
		'AVG([value]) AS [value] ' +
		'FROM ? AS tempresults ' +
		'GROUP BY date';
	response = alasql(sqlStatement, [response]); */
	// console.log(response);
	// console.table(response);
	// sqlbookmark

	this.data = response;
	this.datatypesAndValues = {};
	this.measurementsAndDescriptions = {};
	this.datesAndValues = [];
    for (i=0;i<response.length;i++) {
		// For when the response contains information about stations, locations, and datatypes
        datatype = response[i].datatype;
        value = response[i].value;
        this.datatypesAndValues[datatype] = value;
		
		// For when the response contains single values for a date range
		// and not an array of values for multiple days
		measurement = response[i].id;
        description = response[i].name;
        this.measurementsAndDescriptions[measurement] = description;

		// For when the results contain an array of dates and temperatures
		date = response[i].date;
		date = date.substring(0, 10);
		value = response[i].value;
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
// Output JSON ajax response from custom URL to preformatted html
function ajaxResponseCustom(response) {
	var responseStringified, responseDiv;
	responseStringified = response.responseJSON.results
	responseStringified = JSON.stringify(responseStringified, null, 4);
	console.log(response.responseJSON.results);
	responseDiv = $('<div id="responseDiv" style="white-space:pre;"></div>');
    responseDiv.html(responseStringified);
	$('body').append(responseDiv);
}

function ajaxResponseStationInfo(response) {
	var responseStringified, responseDiv;
	responseStringified = response.responseJSON
	responseStringified = JSON.stringify(responseStringified, null, 4);
	console.log(responseStringified);
	responseDiv = $('<div id="stationinfo" style="white-space:pre;"></div>');
    responseDiv.html(responseStringified);
	$('body').append(responseDiv);
}

function getHighsResponse(response, row, compiledData, dateRangeObj, year) {
	var i, singleYearData, winter, date, value;
	var multiTemp = new WeatherResponse(response, dateRangeObj, year);
	multiTemp = multiTemp.datesAndValues;
	console.log('Row ' + row);
	console.log('Calculated row: ' + (year - dateRangeObj.start.year));

	singleYearData = new WeatherResponse(response, dateRangeObj, year).data;
	compiledData[year - dateRangeObj.start.year] = singleYearData;

	// Create array with dates and values
	/* compiledData.date[year - dateRangeObj.start.year] = [];
	compiledData.value[year - dateRangeObj.start.year] = [];
	for (i=0;i<multiTemp.length;i++) {
		winter = multiTemp[0][0].substr(0,4);
		date = multiTemp[i][0];
		value = multiTemp[i][1];
		compiledData.date[year - dateRangeObj.start.year][i] = date;
		compiledData.value[year - dateRangeObj.start.year][i] = value;
	} */
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

// bookmark
//ajaxResponseCustom(response)
// get data

// get data for a custom URL. It will be outputted to html as preformatted JSON text.
function getDataCustom(webpage, urlParameters) {
	var urlOutput = buildUrlCustom(webpage, urlParameters);
	console.log(urlOutput);
	$.ajax({
        url: urlOutput,
        headers: {token: urlAndToken.token},
        complete: function (response) {
            ajaxResponseCustom(response);
        },
        error: function (response) {
            console.log('Error: No Server response');
        }
	});
}


function getDataStationInfo(station) {
	var urlOutput = 'https://www.ncdc.noaa.gov/cdo-web/api/v2/stations/' + station;
	console.log(urlOutput);
	$.ajax({
        url: urlOutput,
        headers: {token: urlAndToken.token},
        complete: function (response) {
            ajaxResponseStationInfo(response);
        },
        error: function (response) {
            console.log('Error: No Server response');
        }
	});
}

// get temerature highs
function getHighs(dateRangeObj, year, row, station, compiledData) {
	var i, j, urlOutput, chartTall, excelTable;
	// Create a version 2 of compiledData, because
	// if you don't then the browser goes into
	// an infinite loop and crashes

	urlOutput = buildUrlRangeOfDays(year, dateRangeObj, station);
    $.ajax({
        url: urlOutput,
        headers: {token: urlAndToken.token},
        complete: function (response) {
			var dateArraysConcatenated;
			var temperatureArray = [];
			var dateArray = [];
			var currentDate, nextDate;
			var compiledData2 = {};
			var sqlStatement, sqlResult;
			var compiledDataJSON = []; // Actually this is an array of jsons

			// I shall find the error that is causing all of the rows of values in compiledData to be concatenated into the first row

		
			// console.log(response.responseJSON.results);
			$('#exceltable').html('Loading year: ' + year);
			getHighsResponse(response, row, compiledData, dateRangeObj, year); // Process data
			if (year === dateRangeObj.end.year) {

				for (i=0; i<compiledData.length; i++) {
					temperatureArray[i] = [];
					dateArray[i] = [];
					for (j=0; j<compiledData[i].length; j++) {
						temperatureArray[i].push(compiledData[i][j].value);
						dateArray[i].push(compiledData[i][j].date);
					}
				}
				//console.log(compiledData);
				// console.table(compiledDataJSON[0]);
				// sqlStatement = 'SELECT * FROM ? as weather';
				// sqlResult = alasql(sqlStatement, [compiledDataJSON[0]]);
				// console.table(sqlResult);
				// sqlbookmark

				chartTall = transposeArray(temperatureArray);
				// console.log('Transposed chart:' + chartTall);
				excelTable = arrayToTable(chartTall, {
						thead: false
				});
				$('#exceltable').html(excelTable);
				plotlyChart(compiledData, dateRangeObj);
			}
			if (year < dateRangeObj.end.year) {
				year++;
				row++;
				getHighs(dateRangeObj, year, row, station, compiledData); // Query server again
			}
},
        error: function (response) {
			console.log('Server error');
        }
	});
}

// I shall find the invalid time value error

// Get available data types
function getAvailableDataTypes() {
    var orchards = 'https://www.ncdc.noaa.gov/cdo-web/api/v2/datatypes?stationid=GHCND:US1WACK0003&startdate=1970-01-01&enddate=2100-12-31',
	everywhereGSOM = 'https://www.ncdc.noaa.gov/cdo-web/api/v2/datatypes?datasetid=GSOM',
	everywhereGHCND = 'https://www.ncdc.noaa.gov/cdo-web/api/v2/datatypes?datasetid=GHCND',
	dataSetsWithTemp = 'https://www.ncdc.noaa.gov/cdo-web/api/v2/datasets?datatypeid=LTMN',
	dataSetsAll = 'https://www.ncdc.noaa.gov/cdo-web/api/v2/datasets',
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


function sql() {
	alasql("CREATE TABLE test (language INT, hello STRING)");
	alasql("INSERT INTO test VALUES (1,'Hello!')");
	alasql("INSERT INTO test VALUES (2,'Aloha!')");
	alasql("INSERT INTO test VALUES (3,'Bonjour!')");
	console.log( alasql("SELECT * FROM test WHERE language > 0") );
}
// sqlbookmark


function getFormInput() {
	var year, station;
	var dateRangeInput = {};

	dateRangeInput = {
		start: {
			year: document.getElementById('firstyear').value,
			month: document.getElementById('startmonth').value,
			day: document.getElementById('startday').value
		},
		end: {
			year: document.getElementById('lastyear').value,
		}
	};

	station = document.getElementById('station').value; // get station name
	station = stations[station]; // get stationid from station name
	dateRangeInput.start.day = dateRangeInput.start.day*1; // Convert string to number
	dateRangeInput.start.month = dateRangeInput.start.month*1; // Convert string to number
	dateRangeInput.start.year = dateRangeInput.start.year*1; // Convert string to number
	dateRangeInput.end.year = dateRangeInput.end.year*1; // Convert string to number

	dateRangeInput.start.date = new Date(
		dateRangeInput.start.year,
		dateRangeInput.start.month - 1,
		dateRangeInput.start.day + 1);
	
	// End date = start date - 1 day,
	// but with end year from html form
	dateRangeInput.end.date = addDays(dateRangeInput.start.date, -1);
	dateRangeInput.end.date.setFullYear(dateRangeInput.end.year) - 1;

	dateRangeInput.start.ISOstring = dateRangeInput.start.date.toISOString().substring(0,10);
	dateRangeInput.end.ISOstring = dateRangeInput.end.date.toISOString().substring(0,10);

	// Don't use methods .getMonth() and .getDate()
	// because they can't cycle correctly from Dec to Jan
	dateRangeInput.end.month = dateRangeInput.end.ISOstring.substring(5,7)*1;
	dateRangeInput.end.day = dateRangeInput.end.ISOstring.substring(8,10)*1;

	// console.table(dateRangeInput);

	year = dateRangeInput.start.year;
	getDataStationInfo(station);
	getHighs(dateRangeInput, year, 0, station, compiledData);
}

function launchapp() {
	getFormInput();
}

// This is normally launched via the html form,
// but you can start it here, too.
launchapp();


// Get list of stations in laihia area
// This is an implementation of getDataCustom() where you can make a url from scratch
// for use with the NCEI API
function laihiastations() {
	var webpage = 'stations';
	var urlParameters = {
		extent: boundingboxes.laihia,
	};
	// Produces https://www.ncdc.noaa.gov/cdo-web/api/v2/stations?extent=63,22.7,62.7,21.8
	getDataCustom(webpage, urlParameters);
}

// Launch app on load
$(function () {
	// laihiastations();
	// plotlyChartTest();
	// sql();
});






// JSON.stringify()
// JSON.parse(response.responseText)
// $('#output').html(responseString);
// var responseJSON = response.responseJSON;
// url: 'https://www.ncdc.noaa.gov/cdo-web/api/v2/datasets?stationid=GHCND:US1WACK0003',