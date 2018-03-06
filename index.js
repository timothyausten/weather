/*global $,console,document*/
/* https://eslint.org/docs/user-guide/configuring */
/*eslint no-console: "off", no-unused-vars: "off"*/


var urlAndToken = {},
    urlParams = {};

// document.getElementById('token')

urlAndToken = {
    url: 'https://www.ncdc.noaa.gov/cdo-web/api/v2/data?',
    token: document.getElementById('token').value,
}
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

// Format and output weather data from AJAX response
function ajaxResponse(response) {
    var i, datatype, value, datatypesAndValues = {};
    var beautifiedJSON = JSON.stringify(response, null, 4);
    // console.log(response);
    for (i=0;i<response.responseJSON.results.length;i++) {
        datatype = response.responseJSON.results[i].datatype;
        value = response.responseJSON.results[i].value;
        datatypesAndValues[datatype] = value;
        $('#output').html(JSON.stringify(datatypesAndValues, null, 4));
    }
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
        $('#output2').html(JSON.stringify(datatypesAndValues, null, 4));
    }
}




function buildUrl() {
    // GSOM dataset (Global Summary of the Month) for GHCND station USC00010008, for May of 2010 with standard units
    var baseUrl, params, url;
    baseUrl = urlAndToken.url;
    params = urlParams.orchards;
    // Produces, for example, datasetid=GSOM&stationid=GHCND:USC00010008&units=standard&startdate=2010-05-01&enddate=2010-05-31
    params = $.param(params);
    url = baseUrl + params;
    return url;
}
console.log(buildUrl());

// get data
function getData() {
    $.ajax({
        url: buildUrl(),
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

// Wait for document.getElementById('token').value to contain value
// For some reason, this just isn't working, and the API token gets rejected.
// Interestingly, without the timeout, alert() returns the api token, but console.log() does not
function calc(){
    setTimeout(function () {
        console.log(document.getElementById('token').value);
        getData();
        getAvailableDataTypes();
    }, 1000)
}



// JSON.stringify()
// JSON.parse(response.responseText)
// $('#output').html(responseString);
// var responseJSON = response.responseJSON;
// url: 'https://www.ncdc.noaa.gov/cdo-web/api/v2/datasets?stationid=GHCND:US1WACK0003',
