/**
 * Created by Peihong Guo on 11/28/13.
 */

function computeCentroids( samples, n ) {
    var centroids = new Array(n);
    for(var j=0;j<n;j++) {
        centroids[j] = Color.zero();
    }

    for(var i=0;i<samples.length;i++) {
        var c = samples[i].cluster;
        centroids[c] = centroids[c].addc(samples[i]);
        centroids[c].a++;
    }

    var maxCluster = 0, maxCount = 0;
    for(var j=0;j<n;j++) {
        if( centroids[j].a == 0 ) {
            // randomly reinitialize this centroid
            centroids[j] = Color.rand();
            continue;
        }
        centroids[j].normalize();

        if( centroids[j].a > maxCount )
        {
            maxCluster = j;
            maxCount = centroids[j].a;
        }
    }

    return {
        centroids: centroids,
        maxCluster: maxCluster,
        maxCount: maxCount
    }
}

function assignClusters( samples, centroids ) {
    var moveCount = 0;
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

    return {
        samples: samples,
        moveCount: moveCount
    };
}

function initkmeans( inColors, n ) {
    var centroids = [];
    centroids.push( Color.rand() );

    var rand = function(a, b) {
        return a + Math.random() * (b-a);
    };

    var m = 32;
    var initsamples = [];
    while( centroids.length < n ) {
        // add m samples from the input color
        for(var i=0;i<m;i++) {
            initsamples.push(inColors[Math.round(Math.random() * (inColors.length - 1))]);
        }

        // assign the samples to the clusters
        var initsamples = assignClusters(initsamples, centroids).samples;

        // compute the new centroids
        var nc = computeCentroids( initsamples, centroids.length );
        var centroids = nc.centroids;

        // split the largest cluster
        var moveSize = 20;
        var newcentroid = centroids[nc.maxCluster].addc(new Color(
            rand(-0.5, 0.5) * moveSize,
            rand(-0.5, 0.5) * moveSize,
            rand(-0.5, 0.5) * moveSize,
            0)
        );

        // move the centroid a little
        centroids[nc.maxCluster] = centroids[nc.maxCluster].addc(
            new Color(
                rand(-0.5, 0.5) * moveSize,
                rand(-0.5, 0.5) * moveSize,
                rand(-0.5, 0.5) * moveSize,
                0
            )
        );
        centroids.push(newcentroid);
    }

    return centroids;
}

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
    var centroids = initkmeans(inColors, n);

    // k-means
    var THRES = 32;
    var MAX_ITERS = 2048;
    var iters = 0;
    var moveCount = Number.MAX_VALUE;
    while( moveCount > THRES && iters < MAX_ITERS ) {
        iters++;

        // assign samples to clusters
        var ns = assignClusters( samples, centroids);
        samples = ns.samples;
        moveCount = ns.moveCount;

        //console.log(moveCount);

        // update centroids
        centroids = computeCentroids( samples, n).centroids;
    }

    console.log('iters = ' + iters);
    return centroids;
}