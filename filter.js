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
	}
};