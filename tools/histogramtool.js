/**
 * Created by PhG on 11/17/13.
 */

var HistogramTool = function() {
    var width = 255, height = 255;
    var mode = 'brightness';

    // histogram
    var hist = [];

    var svg, area;

    this.bindImage = function( I ) {
        switch( mode ) {
            case 'brightness': {
                var h = histogram(I, 0, 0, I.w, I.h);
                this.bindHistogram(h);
                break;
            }
            case 'rgb':
            {
                var h = colorHistogram(I, 0, 0, I.w, I.h);
                this.bindHistogram(h);
                break;
            }
            default: {
                throw 'invalid histogram mode!';
            }
        }
    };

    this.bindHistogram = function( h ) {
        console.log('bind histogram');
        switch( mode ) {
            case 'brightness': {
                hist = [];
                var sum = 0;
                var maxHist = 0;
                for(var i=0;i< h.length;i++) {
                    hist[i] = {lev: i, cnt: h[i]};
                    sum += h[i];
                    maxHist = Math.max(maxHist, h[i]);
                }
        
                // normalize
                var factor = 0.9 / maxHist;
                for(var i=0;i< h.length;i++) {
                    hist[i].cnt *= factor;
                }
        
                console.log(hist);                
                break;
            }
            case 'rgb': {
                
                for(var c=0;c<3;c++) {
                                
                    hist[c] = [];
                    var sum = 0;
                    var maxHist = 0;
                    for(var i=0;i< h[c].length;i++) {
                        hist[c][i] = {lev: i, cnt: h[c][i]};
                        sum += h[c][i];
                        maxHist = Math.max(maxHist, h[c][i]);
                    }
            
                    // normalize
                    var factor = 0.9 / maxHist;
                    for(var i=0;i< h[c].length;i++) {
                        hist[c][i].cnt *= factor;
                    }
            
                    console.log(hist[c]);   
                }
                
                break;
            }
            default: {
                throw 'invalid histogram mode!';
            }
        }

        redraw();
    };

    function redraw() {
        // display the histogram
        
        switch(mode) {
            case 'rgb': {
                for(var i=0;i<3;i++) {
                    svg.select("#hist" + i).datum(hist[i])
                        .attr("class", "area")
                        .attr("d", area[i]);                    
                }
                break;
            }
            case 'brightness': {
                svg.selectAll("path").datum(hist)
                    .attr("class", "area")
                    .attr("d", area);                
                break;
            }
        }
    }

    this.init = function( target, m ) {
        if( !target ) {
            throw "failed to initialize histogram tool";
        }

        mode = m || mode;

        var x = d3.scale.linear()
            .range([0, width]);
        var y = d3.scale.linear()
            .range([height, 0]);
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        svg = d3.select(target).append("svg")
            .attr("id", "histogram")
            .attr("class", "back")
            .attr("width", width)
            .attr("height", height);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end");

        x.domain([0, 255]);
        y.domain([0.0, 1.0]);

        switch( mode ) {
            case 'brightness':
            {
                area = d3.svg.area()
                    .x(function(d) { return x(d.lev); })
                    .y0(height)
                    .y1(function(d) { return y(d.cnt); });
                svg.append("path")
                    .datum(hist)
                    .attr("class", "area")
                    .attr("d", area);
                break;
            }
            case 'rgb': {
                hist = new Array(3);
                area = new Array(3);
                var cls = ['red', 'green', 'blue'];
                for(var i=0;i<3;i++) {
                    hist[i] = [];
                    area[i] = d3.svg.area()
                        .x(function(d) { return x(d.lev); })
                        .y0(height)
                        .y1(function(d) { return y(d.cnt); });
                    svg.append("path")
                        .attr("id", 'hist' + i)
                        .datum(hist[i])
                        .attr("class", "area")
                        .attr("d", area[i]);
                    $('#hist' + i).addClass( cls[i] );
                }
                break;
            }
            default: {
                throw 'invalid histogram mode!';
            }
        }
    }
};