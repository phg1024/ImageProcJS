/**
 * Created by PhG on 11/14/13.
 */

function rgb2hex( c ) {
    return ("0" + c.r.toString(16)).slice(-2) +
        ("0" + c.g.toString(16)).slice(-2) +
        ("0" + c.b.toString(16)).slice(-2);
}

function hex2rgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if( !result ) console.log( hex );
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgb2int( c ) {
    return c.r << 16 | c.g << 8 | c.b;
}

function int2rgb( v ) {
    return {
        r: (v >> 16) & 0xff,
        g: (v >> 8 ) & 0xff,
        b: v & 0xff
    }
}

function rgb2hsv(c){
    //***Returns an hsv object from RGB values
    //***The r (red), g (green), and b (blue) should be values in the range 0 to 1
    //***The returned object has .h, .s, and .v properties.
    //***h is a value from 0 to 360
    //***s and v are values between 0 and 1
    var h,s,v,max,min,d;
    r = c.r / 255.0, g = c.g / 255.0, b = c.b / 255.0;

    r=r>1?1:r<0?0:r;
    g=g>1?1:g<0?0:g;
    b=b>1?1:b<0?0:b;

    max=min=r;
    if (g>max) max=g; if (g<min) min=g;
    if (b>max) max=b; if (b<min) min=b;
    d=max-min;
    v=max;
    s=(max>0)?d/max:0;

    if (s==0) h=0;
    else {
        h=60*((r==max)?(g-b)/d:((g==max)?2+(b-r)/d:4+(r-g)/d));
        if (h<0) h+=360;
    }
    return {h:h,s:s,v:v}
}

function hsv2rgb( c ){
    //***Returns an rgb object from HSV values
    //***h (hue) should be a value from 0 to 360
    //***s (saturation) and v (value) should be a value between 0 and 1
    //***The .r, .g, and .b properties of the returned object are all in the range 0 to 1
    var r,g,b,i,f,p,q,t;
    h = c.h, s = c.s, v = c.v;
    while (h<0) h+=360;
    h%=360;
    s=s>1?1:s<0?0:s;
    v=v>1?1:v<0?0:v;

    if (s==0) r=g=b=v;
    else {
        h/=60;
        f=h-(i=Math.floor(h));
        p=v*(1-s);
        q=v*(1-s*f);
        t=v*(1-s*(1-f));
        switch (i) {
            case 0:r=v; g=t; b=p; break;
            case 1:r=q; g=v; b=p; break;
            case 2:r=p; g=v; b=t; break;
            case 3:r=p; g=q; b=v; break;
            case 4:r=t; g=p; b=v; break;
            case 5:r=v; g=p; b=q; break;
        }
    }
    return {r:r * 255, g:g * 255, b:b * 255};
}

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

    for(var y=y1;y<y2;++y)
    {
        for(var x=x1;x<x2;++x)
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
    for(var i=0;i<num_bins;++i)
        hist[i] = 0;

    for(var y=y1;y<y2;++y)
    {
        for(var x=x1;x<x2;++x)
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
    for(var i=1;i<num_bins;++i)
        cumuhist[i] = cumuhist[i-1] + hist[i];

    return cumuhist;
}

function normalizecdf( cdf, scale, num_bins ) {
    if( num_bins == undefined )
        num_bins = 256;
    var scale = scale || 1.0;

    var total = cdf[num_bins-1];
    var ncdf = new Array(num_bins);
    for(var i=0;i<num_bins;++i)
        ncdf[i] = cdf[i] / total * scale;

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

// find the closest color in a given color map
function findClosestColor(c, colormap) {
    var minIdx = 0;
    var minDist = c.distance(colormap[0]);
    for(var i=1;i<colormap.length;++i) {
        var ci = colormap[i];
        var dist = c.distance( ci );

        if( dist < minDist ) {
            minDist = dist;
            minIdx = i;
        }
    }

    return colormap[minIdx];
}