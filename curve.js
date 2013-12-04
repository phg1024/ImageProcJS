function CatmullRomCurve( pts ) {
    // the curve is generated using uniform knots
    this.p = pts;
    this.m = [];
    // compute the m values
    for(var i=0;i< pts.length;i++) {
        if( i == 0 ) {
            this.m.push({ x:0.5 * (pts[i+1].x - pts[i].x), y: 0.5 * (pts[i+1].y - pts[i].y)});
        }
        else if( i == pts.length - 1 ) {
            this.m.push({x: 0.5 * (pts[i].x - pts[i-1].x), y: 0.5 * (pts[i].y - pts[i-1].y)});
        }
        else {
            this.m.push({x: 0.5 * (pts[i+1].x - pts[i-1].x), y: 0.5 * (pts[i+1].y - pts[i-1].y)});
        }
    }

    this.h00 = function( t ) {
        return (1 + 2 * t) * ( 1 - t) * (1 - t);
    }

    this.h10 = function( t ) {
        return t * (1-t) * (1-t);
    }

    this.h01 = function( t ) {
        return t * t * (3 - 2 * t);
    }

    this.h11 = function( t ) {
        return t * t * (t - 1);
    }

    this.getValue = function( x ) {
        // find the segment x is in
        for(var i=0;i<this.p.length-1;i++) {
            if( x >= this.p[i].x && x <= this.p[i+1].x ){
                // compute the t value using binary search

                var xl, yl, xr, yr;
                xl = this.p[i].x; yl = this.p[i].y;
                xr = this.p[i+1].x; yr = this.p[i+1].y;
                var mxl, myl, mxr, myr;
                mxl = this.m[i].x; myl = this.m[i].y;
                mxr = this.m[i+1].x; myr = this.m[i+1].y;

                var t = 0.5, lt = 0, rt = 1.0;
                var found = false;
                var y = -1;
                while( !found ) {
                    var h00 = this.h00(t), h10 = this.h10(t), h01 = this.h01(t), h11 = this.h11(t);
                    var px = h00 * xl + h10 * mxl + h01 * xr + h11 * mxr;
                    var py = h00 * yl + h10 * myl + h01 * yr + h11 * myr;

                    var THRES = 0.01;
                    if( Math.abs(px - x) < THRES )
                    {
                        found = true;
                        y = py;
                    }
                    else {
                        if( x > px ) {
                            lt = t;
                            t = 0.5 * (lt + rt);
                        }
                        else {
                            rt = t;
                            t = 0.5 * (lt + rt);
                        }
                    }
                }

                y = clamp(Math.round(y), 0, 255);
                return y;
            }
        }
    }
}