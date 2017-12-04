
function ajaxResponse(response) {
    var beautifiedJSON = JSON.stringify(response, null, 4);
    var precipitation = response.responseJSON.results[8].value;
    $('#output').html(precipitation);
    console.log(response);
}

function buildUrl() {
    // GSOM dataset (Global Summary of the Month) for GHCND station USC00010008, for May of 2010 with standard units
    var baseUrl = 'https://www.ncdc.noaa.gov/cdo-web/api/v2/data',
        datasetid = 'GSOM',
        stationid = 'GHCND:USC00010008',
        units = 'standard',
        startdate = '2010-05-01',
        enddate = '2010-05-31',
        url = baseUrl + '?datasetid=' + datasetid + '&stationid=' + stationid + '&units=' + units + '&startdate=' + startdate + '&enddate=' + enddate;
    return url;
};
console.log(buildUrl());

$(function() {
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
