function transposeArray(a) {
    // https://stackoverflow.com/a/4492703
    
    var w, h, i, j, t = [];
    var rowheight = [];

    // Find width of array
    w = a.length;
    // Find height of array
    for(i=0; i<a.length; i++) {
        rowheight[i] = a[i].length;
    }
    h = Math.max.apply(Math, rowheight);

  
    // In case it is a zero matrix, no transpose routine needed.
    if(h === 0 || w === 0) { return []; }
  
    /**
     * @var {Number} i Counter
     * @var {Number} j Counter
     * @var {Array} t Transposed data is stored in this array.
     */

  
    // Loop through every item in the outer array (height)
    for(i=0; i<h; i++) {
  
        // Insert a new row (array)
        t[i] = [];
  
        // Loop through every item per item in outer array (width)
        for(j=0; j<w; j++) {
            // Save transposed data.
            t[i][j] = a[j][i];
        }
    }
    return t;
}