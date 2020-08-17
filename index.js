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
	locations = {},
	stations = {},
	boundingboxes = {},
	JSON2HtmlTableValues = '<table>',
	JSON2HtmlTableDates = '<table>',
	compiledData = {};

	compiledData.date = [];
	compiledData.value = [];





// document.getElementById('token')

urlAndToken = {
	url: 'https://www.ncdc.noaa.gov/cdo-web/api/v2/data?',
    token: 'uZXRsebTFuZXQayyYanptuRTghYsovlk'
};


dateRangeInput = {
	start: {
		year: 2008,
		month: 10,
		day: 1
	}, end: {
		year: 2009,
		month: 3,
		day: 31
	}
};

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

function buildUrlRangeOfDays(year, station) {
    // GHCND dataset (Global daily summaries) for GHCND station USC00010008, for May of 2010 with standard units
    // Produces, for example, datasetid=GSOM&stationid=GHCND:USC00010008&units=standard&startdate=2010-05-01&enddate=2010-05-31
    var baseUrl, params, url;
	var d = [];
    baseUrl = urlAndToken.url;
    params = urlParams.maxTempAtLocation;
	d = new dateRangeConstructor(year);
	params.stationid = station;
	params.startdate = d.startString;
	params.enddate = d.endString;
    params = $.param(params);
    url = baseUrl + params;
    return url;
}

function WeatherResponse(response) {
	var i, datatype, value, measurement, description, date, value, alasqlResponse;
	var daysOfYearBegin, daysOfYearEnd;
	var daysOfYear = [];
	var daysOfYearJSON = [];
	var daysOfYearSQL, sqlOuterJoin;
	var beautifiedJSON = JSON.stringify(response, null, 4);
	var sqlStatement;

	response = response.responseJSON.results;

	// Make an array of calendar days in the format mm-dd
	for (i=0; i<366; i++) {
		daysOfYear[i] = addDays(new Date('2020-01-01'), i);
		daysOfYear[i] = daysOfYear[i].toISOString().substring(5,10);
		daysOfYearJSON[i] = {};
		daysOfYearJSON[i].mmdd = daysOfYear[i];
	}

	for (i=0; i<response.length; i++) {
		// Truncate date to 10 characters in format yyyy-mm-dd
		response[i].date = response[i].date.substring(0,10);
		// Add column for mm-dd
		response[i].mmdd = response[i].date.substring(5,10);
		// Add column for winter year
		response[i].winter = response[0].date.substring(0,4);
	}

	// See example of how to import json into table
	// https://github.com/agershun/alasql/blob/develop/examples/nodesample.js

	var db = new alasql.Database();
	db.exec('CREATE TABLE calenda');
	db.tables.calenda.data = daysOfYearJSON;
	var res1 = db.exec('SELECT * FROM calenda ORDER BY mmdd');
	db.exec('CREATE TABLE response');
	db.tables.response.data = response;
	var res2 = db.exec('SELECT * FROM response ORDER BY mmdd');

	sqlOuterJoin = db.exec(
		'SELECT * ' +
		'FROM response ' +
		'OUTER JOIN calenda ' +
		'ON response.mmdd=calenda.mmdd ' +
		'ORDER BY mmdd DESC'
	);
	console.table(sqlOuterJoin);
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
	console.table(response.responseJSON.results);
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

function getHighsResponse(response, row, compiledData) {
	var i, winter, date, value;
	var multiTemp = new WeatherResponse(response);
	multiTemp = multiTemp.datesAndValues;
	console.log('row ' + row);

	// Create array with dates and values
	compiledData.date[row] = [];
	compiledData.value[row] = [];
	for (i=0;i<multiTemp.length;i++) {
		winter = multiTemp[0][0].substr(0,4);
		date = multiTemp[i][0];
		value = multiTemp[i][1];
		compiledData.date[row][i] = date;
		compiledData.value[row][i] = value;
	}
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
function getHighs(year, firstyear, finalyear, row, station, compiledData) {
	var i, j, urlOutput, chartTall, excelTable;
	// Create a version 2 of compiledData, because
	// if you don't then the browser goes into
	// an infinite loop and crashes

	urlOutput = buildUrlRangeOfDays(year, station);
    $.ajax({
        url: urlOutput,
        headers: {token: urlAndToken.token},
        complete: function (response) {
			var currentDate, nextDate;
			var compiledData2 = {};
			var dateArraysConcatenated;
			var sqlStatement, sqlResult;
			var compiledDataJSON = []; // Actually this is an array of jsons
		
			// console.log(response.responseJSON.results);
			$('#exceltable').html('Loading year: ' + year);
			getHighsResponse(response, row, compiledData); // Process data
			if (year === finalyear) {


				/* function testForMissingDays(dates, i, j) {
					// If at least one day is missing then true
					var d1, d2, diff;
					d1 = new Date(dates[i][j]);
					d2 = new Date(dates[i][j+1]);
					diff = Math.round((d2 - d1)/86400000); // Test if one day interval
					// console.log(d1);
					// console.log(i + ' ' + j);
					if (diff>1) {
						return true;
					} else {
						return false;
					}
				}
				compiledData2 = compiledData;
				for (i=0; i<compiledData.date.length; i++) {
					for (j=0; j<compiledData.date[i].length-1; j++) {
						currentDate = new Date(compiledData.date[i][j]);
						nextDate = addDays(currentDate, 1).toISOString().substring(0, 10);
						if (testForMissingDays(compiledData.date, i, j)) {
							console.log(typeof nextDate);
							console.log(nextDate);
							compiledData2.date[i].splice((j+1), 0, 'hello world');
							compiledData2.value[i].splice((j+1), 0, null);
						} else {
							// console.log('Diff is not greater than one day');
						}
					}
				}
				compiledData = compiledData2;
				console.log(compiledData.date[0]); */

				// Concatenate date arrays into one array
				dateArraysConcatenated = concatSubArrays(compiledData.date);

				for (i=0; i<compiledData.date.length; i++) {
					compiledDataJSON[i] = {};
					compiledDataJSON[i] = [];
					compiledDataJSON[i][j] = {};
					for (j=0; j<compiledData.date[i].length; j++) {
						compiledDataJSON[i][j] = {
							'date': compiledData.date[i][j],
							'tmax': compiledData.value[i][j]
						};
					}
				}
				console.log(compiledData);
				// console.table(compiledDataJSON[0]);
				sqlStatement = 'SELECT * FROM ? as weather';
				sqlResult = alasql(sqlStatement, [compiledDataJSON[0]]);
				// console.table(sqlResult);
				// sqlbookmark



				chartTall = transposeArray(compiledData.value);
				// console.log('Transposed chart:' + chartTall);
				excelTable = arrayToTable(chartTall, {
						thead: false
				});
				$('#exceltable').html(excelTable);
				plotlyChart(compiledData.date, compiledData.value, firstyear);
			}
			if (year < finalyear) {
				year++;
				row++;
				getHighs(year, firstyear, finalyear, row, station, compiledData); // Query server again
			}
},
        error: function (response) {
			console.log('Server error');
        }
	});
}


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

function launchapp() {
	var year, firstyear, lastyear, station;

	firstyear = document.getElementById('firstyear').value;
	lastyear = document.getElementById('lastyear').value;
	// station = stations.kauhajoki;
	station = document.getElementById('station').value;
	station = stations[station]; // get stationid from station name
	firstyear = firstyear*1; // Convert string to number
	lastyear = lastyear*1; // Convert string to number
	year = firstyear;
	getDataStationInfo(station);
	getHighs(year, firstyear, lastyear, 0, station, compiledData);	
}
// This is normally launched via the html form,
// but you can start it here, too.
// launchapp();


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