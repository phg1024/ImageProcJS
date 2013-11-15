/**
 * Created by PhG on 11/14/13.
 */

var clamp = function(v, lower, upper) {
    return Math.max(lower, Math.min(v, upper));
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