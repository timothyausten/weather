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
	this.start = {};
	this.end = {};
	this.end.month = this.endString.substring(6,7);
	this.end.day = this.endString.substring(9,10);
}


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
   vaasa:      'GHCND:FIE00144212', /* Since 1952. 1994-1996 missing. */
   seinäjoki:  'GHCND:FIE00144322',
   ilomantsi:  'GHCND:FIE00145052' /* 1999-2019 */

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

function buildUrlCustom(params) {
    // Produces url with whatever parameters you want
    var baseUrl, params, url, webpage;
	baseUrl = 'https://www.ncdc.noaa.gov/cdo-web/api/v2/';
	webpage = params.webpage;
	delete params.webpage; // Remove webpage property from params object before running $.param(params)
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

	// If year missing, then fill in year with null values
	if (response == null) {
		var response = [];
		for (i=0; i<366; i++) {
			response[i] = {};
			response[i].date = daysOfYearJSON[i].date;
			response[i].mmdd = daysOfYearJSON[i].mmdd;
			response[i].winter = daysOfYearJSON[i].winter;
			response[i].value = -20;
		}
	}

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
	if (responseDiv) responseDiv.remove();  // If responseDiv exists then remove it 
	responseDiv = $('<div id="responseDiv" style="white-space:pre;"></div>');
    responseDiv.html(responseStringified);
	$('body').append(responseDiv);
}

function ajaxResponseSingleStationInfo(response) {
	var responseStringified, responseDiv;
	responseStringified = response.responseJSON
	responseStringified = JSON.stringify(responseStringified, null, 4);
	// console.log(responseStringified);
	responseDiv = $('<div id="stationinfo" style="white-space:pre;"></div>');
    responseDiv.html(responseStringified);
	$('body').append(responseDiv);
}

function ajaxResponseListOfStations(response) {
	var responseDiv, responseOutput, responseOutputArray, responseOutputTable, pin = [];
	responseOutput = response.responseJSON.results;

	// console.log(responseOutput[0].latitude);
	
	$('.leaflet-interactive').empty();
	$('.leaflet-pane.leaflet-shadow-pane').empty();

	/* for (i=0; i<responseOutput.length; i++) { */
	for (i=0; i<responseOutput.length; i++) {
		pin[i] = L.marker([responseOutput[i].latitude, responseOutput[i].longitude], {
			name: responseOutput[i].name,
			alt: responseOutput[i].name,
			keyboard: true
		});
		pin[i].responseOutPut = responseOutput[i];
		pin[i].on('click', function(){
			console.log(responseOutput[i].id);
			document.getElementById('station').value = this.responseOutPut.id;
			document.getElementById('stationinfo').innerHTML =
				'Station name: ' + this.responseOutPut.name + ', ' +
				'Available records: ' + this.responseOutPut.mindate + ' through ' +
				this.responseOutPut.maxdate;
			console.log(this);
		})
		.addTo(map);
	}

	responseOutputArray = objectToArray(responseOutput);
	responseOutputTable = arrayToTable(responseOutputArray, {th: true, thead: true});

	if ($('#stationlist')) $('#stationlist').remove();  // If responseDiv exists then remove it 
	responseDiv = $('<div id="stationlist"></div>');
    responseDiv.html(responseOutputTable);
	$('body').append(responseDiv);
}

function getHighsResponse(response, row, compiledData, dateRangeObj, year) {
	var i, singleYearData;
	singleYearData = new WeatherResponse(response, dateRangeObj, year).data;
	compiledData.push(singleYearData);

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
function getDataCustom(urlParameters) {
	var urlOutput;

	// If whole url string given, then take that,
	// else build url from object list of parameters
	if (typeof urlParameters === 'string') {
		urlOutput = urlParameters;
	} else {
		urlOutput = buildUrlCustom(urlParameters);
	}
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



function getDataListOfStations(urlParameters) {
	var urlOutput = buildUrlCustom(urlParameters);
	$.ajax({
        url: urlOutput,
        headers: {token: urlAndToken.token},
        complete: function (response) {
            ajaxResponseListOfStations(response);
        },
        error: function (response) {
            console.log('Error: No server response');
        }
	});
}



function getDataSingleStationInfo(station) {
	var urlOutput = 'https://www.ncdc.noaa.gov/cdo-web/api/v2/stations/' + station;
	// console.log(urlOutput);
	$.ajax({
        url: urlOutput,
        headers: {token: urlAndToken.token},
        complete: function (response) {
            ajaxResponseSingleStationInfo(response);
        },
        error: function (response) {
            console.log('Error: No server response');
        }
	});
}

// get temerature highs
function getHighs(dateRangeObj, year, row, station, compiledData, estimateMissingData) {
	var i, j, urlOutput, chartTall, excelTable;

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

				// Add year to first part of html table
				for (i=0; i<temperatureArray.length; i++) {
					temperatureArray[i].unshift(dateRangeObj.start.year + i);
				}

				chartTall = transposeArray(temperatureArray);
				excelTable = arrayToTable(chartTall, {
						thead: false
				});
				// $('#exceltable').html(excelTable);
				plotlyChart(compiledData, dateRangeObj, estimateMissingData);
			}
			if (year < dateRangeObj.end.year) {
				year++;
				row++;
				getHighs(dateRangeObj, year, row, station, compiledData, estimateMissingData); // Query server again
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


function getFormInput() {
	var year, stationID;
	var dateRangeInput = {};
	var estimateMissingData;

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

	stationID = document.getElementById('station').value; // get station name

	// If station name exists in list, use that,
	// else try to enter it as a stationID
	stationID = stations[stationID] || stationID;

	estimateMissingData = document.getElementById('estimate').checked;

	console.log(typeof estimateMissingData);

	year = dateRangeInput.start.year;
	getDataSingleStationInfo(stationID);
	getHighs(dateRangeInput, year, 0, stationID, compiledData, estimateMissingData);
}

function weatherstationmap() {
	var mapDiv, Map, mapBoxParams, mapBoxToken, mapBoxURL, mapBoxURLbase, attribution;
	// mapDiv = $('<div id="mapid" style="height:180px"></div>')
	// $('body').prepend(mapDiv);
	// map = L.map('map').setView([51.505, -0.09], 13);
	map = L.map('map').setView([62.3, 23.3], 5);

	mapBoxURLbase = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={';
	mapBoxToken = 'pk.eyJ1IjoidGltb3RoeWF1c3RlbiIsImEiOiJja2U4OG1zNTEwamhwMnlybm9od3Z1ZHA2In0.MU4oZlSuP2lf4yPU6mPESw';
	mapBoxURL = mapBoxURLbase + mapBoxToken + '}';
	attribution = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>' + ' ' +
	'contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>,' + ' ' +
	'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';

	mapBoxParams = {
		attribution: attribution,
		maxZoom: 18,
		id: 'mapbox/streets-v11',
		tileSize: 516,
		zoomOffset: -1,
		accessToken: mapBoxToken
	};

	function mapBoxFunc() {
		L.tileLayer(mapBoxURL, mapBoxParams).addTo(map);
	}
	function openStreetMapFunc() {
		//add a tile layer to add to our map, in this case it's the 'standard' OpenStreetMap.org tile server
		L.tileLayer(
			'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
			{
				attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
				maxZoom: 18
			}
		).addTo(map);
	}
	openStreetMapFunc();

	function boundingBox(mapObj) {
		// Get OpenStreetMap bounding box of map view
		var swLat = mapObj.getBounds()._southWest.lat;
		var swLng = mapObj.getBounds()._southWest.lng;
		var neLat = mapObj.getBounds()._northEast.lat;
		var neLng = mapObj.getBounds()._northEast.lng;
		var output = [
			[swLat, swLng],
			[neLat, neLng]
		];
		return output;
	}

	map.on('moveend', function() {
		var mapviewBoundingBox = boundingBox(this);
		var rectOptions = {color: 'Red', weight: 1};
		/* var rectangle = L.rectangle(mapviewBoundingBox, rectOptions);
		rectangle.addTo(this); */
		var bb = mapviewBoundingBox;
		bb = bb[0][0] + ', ' + bb[0][1] + ', ' + bb[1][0] + ', ' + bb[1][1];
		// var mapviewBoundingBox = map.toBBoxString(); // didn't work
		console.log(bb);
		getListOfStations(bb);
   });
}

function launchapp() {
	getFormInput();
}

// This is normally launched via the html form,
// but you can start it here, too.
// launchapp();


// Get list of stations in laihia area
// This is an implementation of getDataCustom() where you can make a url from scratch
// for use with the NCEI API
function customUrl() {
	//var urlParameters = {
	//	webpage: 'stations', /* Name of "webpage" after base Url, not a property:value parameter */
	//	extent: boundingboxes.laihia
	//};
	// Produces https://www.ncdc.noaa.gov/cdo-web/api/v2/stations?extent=62.7,21.8,63,22.7
	var urlParameters = 'https://www.ncdc.noaa.gov/cdo-web/api/v2/stations?extent=62.7,21.8,63,22.7';
	getDataCustom(urlParameters);
}

function getListOfStations(mapviewBoundingBox) {
	var urlParameters = {
		webpage: 'stations',
		extent: mapviewBoundingBox
	}
	getDataListOfStations(urlParameters);
}



// Launch app on load
$(function () {
	weatherstationmap();
	getListOfStations(boundingboxes.laihia);
	// plotlyChartTest();
	// sql();
});






// JSON.stringify()
// JSON.parse(response.responseText)
// $('#output').html(responseString);
// var responseJSON = response.responseJSON;
// url: 'https://www.ncdc.noaa.gov/cdo-web/api/v2/datasets?stationid=GHCND:US1WACK0003',