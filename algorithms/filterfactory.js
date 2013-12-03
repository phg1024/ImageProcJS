/**
 * Created by PhG on 12/2/13.
 */

function gaussianfilter(size, sigma) {
    var weights = new Float32Array(size * size);
    // create a gaussian blur filter

    var cx = (size-1) * 0.5;
    var cy = (size-1) * 0.5;
    var r2 = 2.0 * sigma * sigma;

    var wsum = 0;

    for(var i= 0,idx=0;i<size;i++) {
        var dy = i - cy;
        for(var j=0;j<size;j++,idx++) {
            var dx = j - cx;
            weights[idx] = Math.exp(-(dx*dx + dy*dy) / (r2));
            wsum += weights[idx];
        }
    }

    return {
        width: size,
        height : size,
        factor : wsum,
        bias : 0,
        weights : weights
    };
}


function sharpenfilter(size, sigma, amount) {
    var f = gaussianfilter(size, sigma);

    for(var i=0;i< f.weights.length;i++) {
        f.weights[i] *= -1.0;
    }

    var mid = Math.floor((size * size - 1) / 2);
    f.weights[mid] = f.factor + f.weights[mid] + amount;
    f.factor = amount;
    return f;
}

var FilterFactory = {
    createfilter: function( params ) {
        var name = params.name;
        var size = params.size;

        switch( name ) {
            case 'gaussian': {
                var sigma = params.sigma || 1.0;
                return gaussianfilter(size, sigma);
            }
            case 'sharpen': {
                var sigma = params.sigma || 1.0;
                var amount = params.amount || 4.0;
                return sharpenfilter(size, sigma, amount);
            }
        }
    }
};