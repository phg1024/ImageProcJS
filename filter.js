var filters = {
	'grayscale' : function( src ) {
		if( src.type === 'RGBAImage' ) {
			return src.map(function( c ) {				
				var lev = Math.round((c.r * 299 + c.g * 587 + c.b * 114) / 1000);
				c.r = c.g = c.b = lev;
				return c;
			});
		}
		else {
			throw "Not a RGBA image!";
		}
	},
    'brightness' : function( src, val ) {
        if( src.type === 'RGBAImage' ) {
            var dc = new Color(val, val, val, 0);
            return src.map(function( c ) {
                var nc = c.add(dc);
                return nc.clamp();
            });
        }
        else {
            throw "Not a RGBA image!";
        }
    },
    'contrast' : function( src, val ) {
        if( src.type === 'RGBAImage' ) {
            var factor = Math.max((128 + val) / 128, 0);
            return src.map(function( c0 ) {
                var c = c0.mulc(factor);
                return c.clamp();
            });
        }
        else {
            throw "Not a RGBA image!";
        }
    },
    'brightnesscontrast' : function( src, alpha, beta ) {
        if( src.type === 'RGBAImage' ) {
            var factor = Math.max((128 + alpha) / 128, 0);
            var dc = new Color(beta, beta, beta, 0);
            return src.map(function( c0 ) {
                var c = c0.mulc(factor).add(dc);
                return c.clamp();
            });
        }
        else {
            throw "Not a RGBA image!";
        }
    },
    'histogram': function( src ) {
        if( src.type === 'RGBAImage' ) {

            // histogram equalization, blended with orignal image
            // amount is between 0 and 1
            var h = src.h, w = src.w;

            // grayscale image
            var gimg = filters.grayscale(src);

            // build histogram (pdf)
            var hist = histogram(gimg, 0, 0, w, h);

            // compute cdf
            var cumuhist = buildcdf( hist );

            // normalize cdf
            var total = cumuhist[255];
            for(var i=0;i<256;i++)
                cumuhist[i] = Math.round(cumuhist[i] / total * 255.0);

            // equalize
            return src.map(function(c0){
                var lev = Math.round((c0.r * 299 + c0.g * 587 + c0.b * 114) / 1000);
                var cI = cumuhist[lev];
                var ratio = cI / lev;
                return c0.mulc(ratio).clamp().round();
            });
        }
        else {
            throw "Not a RGBA image!";
        }
    },
    'ahe' : function( src ) {
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

                var total = cdf[255];
                for(var k=0;k<256;k++)
                    cdf[k] = Math.round(cdf[k] / total * 255.0);

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
    }
};