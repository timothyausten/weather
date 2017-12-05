/*global $,console*/
/* https://eslint.org/docs/user-guide/configuring */
/*eslint no-console: "off", no-unused-vars: "off"*/


var APIparams = {};

APIparams.example = {
    datasetid: 'GSOM',
    stationid: 'GHCND:USC00010008',
    units: 'standard',
    startdate: '2010-05-01',
    enddate: '2010-05-31'
};
APIparams.orchards = {
    datasetid: 'GSOM',
    stationid: 'GHCND:US1WACK0003',
    units: 'standard',
    startdate: '2010-05-01',
    enddate: '2010-05-31'
};

function ajaxResponse(response) {
    var i, datatype, value, datatypeAndValue;
    var beautifiedJSON = JSON.stringify(response, null, 4);
    console.log(response);
    for (i=0;i<response.responseJSON.results.length;i++) {
        datatype = response.responseJSON.results[i].datatype;
        value = response.responseJSON.results[i].value;
        datatypeAndValue = datatype +  ": " + value;
        $('#output').append(datatypeAndValue);
    }
}

function buildUrl() {
    // GSOM dataset (Global Summary of the Month) for GHCND station USC00010008, for May of 2010 with standard units
    var baseUrl, params, url;
    baseUrl = 'https://www.ncdc.noaa.gov/cdo-web/api/v2/data?';
    params = APIparams.orchards;
    // Produces, for example, datasetid=GSOM&stationid=GHCND:USC00010008&units=standard&startdate=2010-05-01&enddate=2010-05-31
    params = $.param(params);
    url = baseUrl + params;
    return url;
}
console.log(buildUrl());

$(function () {
    $.ajax({
        url: buildUrl(),
        headers: {token: 'uZXRsebTFuZXQayyYanptuRTghYsovlk'},
        complete: function (response) {
            ajaxResponse(response);
        },
        error: function (response) {
            ajaxResponse(response);
        }
    });
});

// JSON.stringify()
// JSON.parse(response.responseText)
// $('#output').html(responseString);
// var responseJSON = response.responseJSON;
// url: 'https://www.ncdc.noaa.gov/cdo-web/api/v2/datasets?stationid=GHCND:US1WACK0003',
