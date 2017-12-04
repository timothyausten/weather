
function ajaxResponse(response) {
    var responseJSON = response.responseJSON;
    $('#output').html(typeof response);
    console.log(response);
}

function getOutput() {
    $.ajax({
        url: 'https://www.ncdc.noaa.gov/cdo-web/api/v2/datasets?stationid=GHCND:US1WACK0003',
        headers: {token: 'uZXRsebTFuZXQayyYanptuRTghYsovlk'},
        complete: function (response) {
            var responseJSON = response.responseJSON;
            var beautifiedJSON = JSON.stringify(responseJSON, null, 4);
            $('#output').html(beautifiedJSON);
            console.log(response.JSON);
        },
        error: function (response) {
            var responseJSON = response.responseJSON;
            var beautifiedJSON = JSON.stringify(responseJSON, null, 4);
            $('#output').html(beautifiedJSON);
            console.log(response);
        }
    });
}

// JSON.stringify()
// JSON.parse(response.responseText)
// $('#output').html(responseString);