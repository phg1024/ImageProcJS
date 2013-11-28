/**
 * Created by Peihong Guo on 11/28/13.
 */
function kmeans(src, n, sr) {
    var h = src.h, w = src.w;
    var inColors = [];
    for(var y= 0;y<h;y++) {
        for(var x=0;x<w;x++) {
            inColors.push(src.getPixel(x, y));
        }
    }

    var sr = sr || 0.25;
    // sample sr% colors
    var nsamples = inColors.length * sr;
    console.log(nsamples);
    var samples = [];
    for(var i=0;i<nsamples;i++) {
        samples.push( inColors[Math.round(Math.random() * (inColors.length - 1))] );
    }

    // initialize the centroids
    var centroids = [];
    centroids.push( {
        r: Math.random() * 255,
        g: Math.random() * 255,
        b: Math.random() * 255
    })

    var m = 32;
    var initsamples = [];
    while( centroids.length < n ) {
        // get m samples from the input color
        for(var i=0;i<m;i++) {
            initsamples.push(inColors[Math.round(Math.random() * (inColors.length - 1))]);
        }

        // assign the samples to the clusters
        for(var i=0;i<initsamples.length;i++) {
            var idx, minDist = Number.MAX_VALUE;
            for(var j=0;j<centroids.length;j++) {
                var dr = initsamples[i].r - centroids[j].r;
                var dg = initsamples[i].g - centroids[j].g;
                var db = initsamples[i].b - centroids[j].b;
                var dist = dr * dr + dg * dg + db * db;
                if( dist < minDist ) {
                    minDist = dist;
                    idx = j;
                }
            }
            initsamples[i].cluster = idx;
        }

        // compute the new centroids
        for(var j=0;j<centroids.length;j++) {
            centroids[j].r = 0;
            centroids[j].g = 0;
            centroids[j].b = 0;
            centroids[j].count = 0;
        }
        for(var i=0;i<initsamples.length;i++) {
            var c = initsamples[i].cluster;
            centroids[c].r += initsamples[i].r;
            centroids[c].g += initsamples[i].g;
            centroids[c].b += initsamples[i].b;
            centroids[c].count++;
        }
        var maxCluster = 0, maxCount = 0;
        for(var j=0;j<centroids.length;j++) {
            if( centroids[j].count == 0 ) {
                // randomly reinitialize this centroid
                centroids[j] = {
                    r: Math.random() * 255,
                    g: Math.random() * 255,
                    b: Math.random() * 255
                };
                continue;
            }

            centroids[j].r /= centroids[j].count;
            centroids[j].g /= centroids[j].count;
            centroids[j].b /= centroids[j].count;

            if( centroids[j].count > maxCount )
            {
                maxCluster = j;
                maxCount = centroids[j].count;
            }
        }

        // split the largest cluster
        var moveSize = 20;
        var newcentroid = {
            r: centroids[maxCluster].r + (Math.random() - 0.5) * moveSize,
            g: centroids[maxCluster].g + (Math.random() - 0.5) * moveSize,
            b: centroids[maxCluster].b + (Math.random() - 0.5) * moveSize
        };

        centroids[maxCluster].r += (Math.random() - 0.5) * moveSize;
        centroids[maxCluster].g += (Math.random() - 0.5) * moveSize;
        centroids[maxCluster].b += (Math.random() - 0.5) * moveSize;
        centroids.push(newcentroid);
    }

    // k-means
    var THRES = 32;
    var MAX_ITERS = 32;
    var iters = 0;
    var moveCount = Number.MAX_VALUE;
    while( moveCount > THRES && iters < MAX_ITERS ) {
        iters++;
        moveCount = 0;

        // assign samples to clusters
        for(var i=0;i<samples.length;i++) {
            var idx, minDist = Number.MAX_VALUE;
            for(var j=0;j<centroids.length;j++) {
                var dr = samples[i].r - centroids[j].r;
                var dg = samples[i].g - centroids[j].g;
                var db = samples[i].b - centroids[j].b;
                var dist = dr * dr + dg * dg + db * db;
                if( dist < minDist ) {
                    minDist = dist;
                    idx = j;
                }
            }
            if( idx != samples[i].cluster ) {
                moveCount++;
            }
            samples[i].cluster = idx;
        }

        // update centroids
        for(var j=0;j<centroids.length;j++) {
            centroids[j].r = 0;
            centroids[j].g = 0;
            centroids[j].b = 0;
            centroids[j].count = 0;
        }
        for(var i=0;i<initsamples.length;i++) {
            var c = initsamples[i].cluster;
            centroids[c].r += initsamples[i].r;
            centroids[c].g += initsamples[i].g;
            centroids[c].b += initsamples[i].b;
            centroids[c].count++;
        }
        for(var j=0;j<centroids.length;j++) {
            if( centroids[j].count == 0 ) {
                // randomly reinitialize this centroid
                centroids[j] = {
                    r: Math.random() * 255,
                    g: Math.random() * 255,
                    b: Math.random() * 255
                };
                continue;
            }

            centroids[j].r /= centroids[j].count;
            centroids[j].g /= centroids[j].count;
            centroids[j].b /= centroids[j].count;
        }
    }

    console.log('iters = ' + iters);
    return centroids;
}