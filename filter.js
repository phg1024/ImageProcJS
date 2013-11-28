var filters = {
    grayscale : function( src ) {
        return src.map(function( c ) {
            var lev = Math.round((c.r * 299 + c.g * 587 + c.b * 114) / 1000);
            c.r = c.g = c.b = lev;
            return c;
        });
    },
    invert : function( src ) {
        return src.map(function( c ) {
            return new Color(255- c.r, 255- c.g, 255- c.b, c.a);
        });
    },
    brightness : function( src, val ) {
        var dc = new Color(val, val, val, 0);
        return src.map(function( c ) {
            var nc = c.add(dc);
            return nc.clamp();
        });
    },
    contrast : function( src, val ) {
        var factor = Math.max((128 + val) / 128, 0);
        return src.map(function( c0 ) {
            var c = c0.mulc(factor);
            return c.clamp();
        });
    },
    brightnesscontrast : function( src, alpha, beta ) {
        var factor = Math.max((128 + alpha) / 128, 0);
        var dc = new Color(beta, beta, beta, 0);
        return src.map(function( c0 ) {
            var c = c0.mulc(factor).add(dc);
            return c.clamp();
        });
    },
    histogram : function( src ) {
        // histogram equalization, blended with orignal image
        // amount is between 0 and 1
        var h = src.h, w = src.w;

        // grayscale image
        var gimg = filters.grayscale(src);

        // build histogram (pdf)
        var hist = histogram(gimg, 0, 0, w, h);

        // compute cdf
        var cdf = buildcdf( hist );
        var cumuhist = normalizecdf(cdf, 255);

        // equalize
        return src.map(function(c0){
            var lev = Math.round((c0.r * 299 + c0.g * 587 + c0.b * 114) / 1000);
            var cI = cumuhist[lev];
            var ratio = cI / lev;
            return c0.mulc(ratio).clamp().round();
        });
    },
    ahe : function( src ) {
        // find a good window size
        var h = src.h, w = src.w;

        // tile size
        var tilesize = [64, 64];

        // number of bins
        var num_bins = 256;

        // number of tiles in x and y direction
        var xtiles = Math.ceil(w / tilesize[0]);
        var ytiles = Math.ceil(h / tilesize[1]);

        var cdfs = new Array(ytiles);
        for(var i=0;i<ytiles;i++)
            cdfs[i] = new Array(xtiles);

        var inv_tile_size = [1.0 / tilesize[0], 1.0 / tilesize[1]];

        var binWidth = 256 / num_bins;

        var gimg = filters.grayscale(src);

        // create histograms
        for(var i=0;i<ytiles;i++)
        {
            var y0 = i * tilesize[1];
            var y1 = Math.min(y0+tilesize[1], h);
            for(var j=0;j<xtiles;j++)
            {
                var x0 = j * tilesize[0];
                var x1 = Math.min(x0+tilesize[0], w);
                var hist = histogram(gimg, x0, y0, x1, y1, num_bins);

                var cdf = buildcdf( hist );
                cdf = normalizecdf(cdf, 255);

                cdfs[i][j] = cdf;
            }
        }

        var dst = new RGBAImage(w, h);

        for(var y=0;y<h;y++)
        {
            for(var x=0;x<w;x++)
            {
                // intensity of current pixel
                var I = gimg.getPixel(x, y).r;

                // bin index
                var bin = Math.floor(I / binWidth);

                // current tile
                var tx = x * inv_tile_size[0] - 0.5;
                var ty = y * inv_tile_size[1] - 0.5;

                var xl = Math.max(Math.floor(tx), 0);
                var xr = Math.min(xl+1, xtiles-1);

                var yt = Math.max(Math.floor(ty), 0);
                var yd = Math.min(yt+1, ytiles-1);

                var fx = tx - xl;
                var fy = ty - yt;

                var cdf11 = cdfs[yt][xl][bin];
                var cdf12 = cdfs[yd][xl][bin];
                var cdf21 = cdfs[yt][xr][bin];
                var cdf22 = cdfs[yd][xr][bin];

                // bilinear interpolation
                var Iout = (1 - fx) * (1 - fy) * cdf11
                    + (1 - fx) * 	   fy  * cdf12
                    +      fx  * (1 - fy) * cdf21
                    +      fx  *      fy  * cdf22;

                var ratio = Iout / I;
                var c = src.getPixel(x, y).mulc(ratio).clamp();
                dst.setPixel(x, y, c);
            }
        }

        return dst;
    },
    // lut is the look up table defined by the input curve
    curve : function(src, lut, channel) {
        switch( channel )
        {
            case 'red':
            {
                return src.map(function(c0) {
                    var c = new Color(lut[c0.r], c0.g, c0.b, c0.a);
                    return c.round().clamp();
                });
            }
            case 'green':
            {
                return src.map(function(c0) {
                    var c = new Color(c0.r, lut[c0.g], c0.b, c0.a);
                    return c.round().clamp();
                });
            }
            case 'blue':
            {
                return src.map(function(c0) {
                    var c = new Color(c0.r, c0.g, lut[c0.b], c0.a);
                    return c.round().clamp();
                });
            }
            case 'brightness':
            default:
            {
                return src.map(function(c0) {
                    var lev = Math.round((c0.r * 299 + c0.g * 587 + c0.b * 114) / 1000);
                    var bias = 1e-6;			// prevent divide by zero
                    var ratio = lut[lev]/(lev + bias);
                    var c = c0.mulc(ratio);
                    return c.round().clamp();
                });
            }
        }
    },
    reduction : function(src, method, colors) {
        switch(method) {
            case 'uniform': {
                var levs = Math.ceil(Math.pow(colors, 1.0/3.0));
                var round = Math.round;
                return src.map(function(c) {
                    var r = round(round((c.r / 255.0) * levs) / levs * 255.0);
                    var g = round(round((c.g / 255.0) * levs) / levs * 255.0);
                    var b = round(round((c.b / 255.0) * levs) / levs * 255.0);
                    return new Color(r, g, b, c.a);
                });
            }
            case 'population': {
                var hist = colorHistogram(src, 0, 0, src.w, src.h);
                var rcdf = normalizecdf( buildcdf(hist[0]) );
                var gcdf = normalizecdf( buildcdf(hist[1]) );
                var bcdf = normalizecdf( buildcdf(hist[2]) );

                var levels = Math.ceil(Math.pow(colors, 1.0/3.0));

                // get sample points using CDF
                var genSamples = function(cdf) {
                    var pts = [];
                    var step = (1.0 - cdf[0]) / levels;

                    for(var j=0;j<=levels;j++) {
                        var p = step * j + cdf[0];
                        for(var i=1;i<256;i++) {
                            if( cdf[i-1] <= p && cdf[i] >= p ) {
                                pts.push(i);
                                break;
                            }
                        }
                    }
                    return pts;
                };

                // sample points in each channel
                var rPoints = genSamples(rcdf),
                    gPoints = genSamples(gcdf),
                    bPoints = genSamples(bcdf);

                // assemble the samples to a color table
                return src.map(function(c) {
                    // find closet r sample point
                    var r = findClosest(c.r, rPoints);

                    // find closet g sample point
                    var g = findClosest(c.g, gPoints);

                    // find closet b sample point
                    var b = findClosest(c.b, bPoints);

                    return new Color(r, g, b, c.a);
                });
            }
            case 'mediancut': {
                var colormap = algorithms.mediancut(src, colors);
                return src.map(function(c) {
                    var nc = findClosestColor(c, colormap);
                    return new Color(nc.r, nc.g, nc.b, c.a);
                });
            }
            case 'knn': {
                var colormap = algorithms.kmeans(src, colors);
                return src.map(function(c) {
                    var nc = findClosestColor(c, colormap);
                    return new Color(nc.r, nc.g, nc.b, c.a);
                });
            }
            case 'ann': {
                var colormap = algorithms.neuralnetwork(src, colors);
                return src.map(function(c) {
                    var nc = findClosestColor(c, colormap);
                    return new Color(nc.r, nc.g, nc.b, c.a);
                });
            }
        }
    }
};