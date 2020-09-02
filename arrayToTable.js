var arrayToTable = function (data, options) {

    "use strict";

    var table = $('<table />'),
        colgroup,
        thead,
        tfoot,
        rows = [],
        row,
        i,
        j,
        defaults = {
            th: true, // Use th element for first row
            thead: false, // Incldue a thead element with the first row
            tfoot: false, // Include a tfoot element with the last row
            attrs: {} // Attributes for the table element
        };

    options = $.extend(defaults, options);

    table.attr(options.attrs);

    // loop through all the rows, we will deal with tfoot and thead later
    for (i = 0; i < data.length; i = i + 1) {
        row = $('<tr />');
        for (j = 0; j < data[i].length; j = j + 1) {
            if (i === 0 && options.th) {
                row.append($('<th />').html(data[i][j]));
            } else {
                row.append($('<td />').html(data[i][j]));
            }
        }
        rows.push(row);
    }

    // Part added by Timothy Austen
    /* colgroup = $('<colgroup />');
    for (i=0; i<data.length; i++) {
        colgroup.append($('<col />'));
    }
    table.append(colgroup); */
    // End of part added by Timothy Austen

    // if we want a thead use shift to get it
    if (options.thead) {
        thead = rows.shift();
        thead = $('<thead />').append(thead);
        table.append(thead);
    }

    // if we want a tfoot then pop it off for later use
    if (options.tfoot) {
        tfoot = rows.pop();
    }

    // add all the rows
    for (i = 0; i < rows.length; i = i + 1) {
        table.append(rows[i]);
    }

    // and finally add the footer if needed
    if (options.tfoot) {
        tfoot = $('<tfoot />').append(tfoot);
        table.append(tfoot);
    }

    return table;
};