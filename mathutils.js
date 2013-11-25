/**
 * Created by PhG on 11/14/13.
 */

var clamp = function(v, lower, upper) {
    return Math.max(lower, Math.min(v, upper));
};

// build histogram for each channel separately
function colorHistogram(img, x1, y1, x2, y2, num_bins) {
    if( num_bins == undefined )
        num_bins = 256;

    var h = img.h;
    var w = img.w;
    var hist = [[], [], []];
    for(var c=0;c<3;c++) {
        for(var i=0;i<num_bins;i++)
            hist[c][i] = 0;
    }

    for(var y=y1;y<y2;y++)
    {
        for(var x=x1;x<x2;x++)
        {
            var c = img.getPixel(x, y);
            var rval = Math.floor((c.r / 255.0) * (num_bins-1));
            var gval = Math.floor((c.g / 255.0) * (num_bins-1));
            var bval = Math.floor((c.b / 255.0) * (num_bins-1));
            hist[0][rval]++;
            hist[1][gval]++;
            hist[2][bval]++;
        }
    }

    return hist;
}

// build histogram of specified image region
function histogram(img, x1, y1, x2, y2, num_bins)
{
    if( num_bins == undefined )
        num_bins = 256;

    var h = img.h;
    var w = img.w;
    var hist = [];
    for(var i=0;i<num_bins;i++)
        hist[i] = 0;

    for(var y=y1;y<y2;y++)
    {
        for(var x=x1;x<x2;x++)
        {
            var idx = (y * w + x) * 4;
            var val = Math.floor((img.data[idx] / 255.0) * (num_bins-1));
            hist[val]++;
        }
    }

    return hist;
}

// build cdf from given pdf
function buildcdf( hist, num_bins )
{
    if( num_bins == undefined )
        num_bins = 256;

    var cumuhist = [];
    cumuhist[0] = hist[0];
    for(var i=1;i<num_bins;i++)
        cumuhist[i] = cumuhist[i-1] + hist[i];

    return cumuhist;
}

function normalizecdf( cdf, num_bins ) {
    if( num_bins == undefined )
        num_bins = 256;

    var total = cdf[num_bins-1];
    var ncdf = new Array(num_bins);
    for(var i=0;i<num_bins;i++)
        ncdf[i] = cdf[i] / total;

    return ncdf;
}

// list is a sorted list, use binary search
function findClosest(val, list) {
    var r = list.length - 1;
    var l = 0;

    while( l <= r ) {
        var m = Math.round((r+l)/2);
        if( val > list[m] ) {
            l = m+1;
        } else if( val < list[m] ) {
            r = m-1;
        }
        else {
            return list[m];
        }
    }

    l = clamp(l, 0, list.length-1);
    r = clamp(r, 0, list.length-1);

    if( Math.abs(list[l] - val) < Math.abs(list[r] - val) ) return list[l];
    else return list[r];
}