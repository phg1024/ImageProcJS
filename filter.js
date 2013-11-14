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
    }
};