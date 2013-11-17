/**
 * Created by peihongguo on 9/30/13.
 */

var CurveTool = function() {
    var width = 255,
        height = 255;

    var points = [[0, height], [width, 0]];

    var dragged = null,
        selected = points[0];

    var line = d3.svg.line();
    var svg;

    var hist = [];
    var hsvg, area;


    this.resetCurveTool = function() {
        while( points.length > 2)
            points.splice(1, 1);

        selected = null;

        redraw();
    };

    this.getLUT = function() {
        // get the point coordinates using the points in the SVG
        var pts = [];
        for(var i=0;i<points.length;i++) {
            // need to flip y coordinates
            pts.push({x: points[i][0], y: 255 - points[i][1]});
        }
        //console.log(pts);

        var crCurve = new CatmullRomCurve(pts);

        // generate lut using catmull-rom curve
        var lut = [0];
        for( var i=1;i<255;i++) {
            lut[i] = crCurve.getValue(i);
        }
        lut.push(255);

        return lut;
    };

    this.bindHistogram = function( h ) {
        console.log('bind histogram');
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

        redraw();
    };

    function redraw() {
        //console.log('redrawing...');

        svg.select("path").attr("d", line);

        // display the dots
        var circle = svg.selectAll("circle")
            .data(points, function(d) { return d; });

        circle.enter().append("circle")
            .attr("r", 1e-6)
            .on("mousedown", function(d) { selected = dragged = d; redraw(); })
            .transition()
            .duration(750)
            .ease("elastic")
            .attr("r", 6.5);

        circle
            .classed("selected", function(d) { return d === selected; })
            .attr("cx", function(d) { return d[0]; })
            .attr("cy", function(d) { return d[1]; });

        circle.exit().remove();

        // display the histogram
        hsvg.selectAll("path").datum(hist)
            .attr("class", "area")
            .attr("d", area);

        if (d3.event) {
            d3.event.preventDefault();
            d3.event.stopPropagation();
        }
    }

    this.initCurveTool = function( target )
    {
        if( !target ) return;

        // add a separate layer for histogram
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

        hsvg = d3.select(target).append("svg")
            .attr("id", "histogram")
            .attr("width", width)
            .attr("height", height);

        hsvg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        hsvg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end");

        x.domain([0, 255]);
        y.domain([0.0, 1.0]);

        area = d3.svg.area()
            .x(function(d) { return x(d.lev); })
            .y0(height)
            .y1(function(d) { return y(d.cnt); });
        hsvg.append("path")
            .datum(hist)
            .attr("class", "area")
            .attr("d", area);

        // add the curve tool
        svg = d3.select(target).append("svg")
            .attr("id", "curvetool")
            .attr("width", width)
            .attr("height", height)
            .attr("tabindex", 1);

        svg.append("rect")
            .attr("id", "rect")
            .attr("width", width)
            .attr("height", height)
            .on("mousedown", mousedown);

        svg.append("path")
            .datum(points)
            .attr("class", "line")
            .call(redraw);

        d3.select(window)
            .on("mousemove", mousemove)
            .on("mouseup", mouseup)
            .on("keydown", keydown);

        line.interpolate("cardinal");
        redraw();
    };

    function sortpoints()
    {
        points.sort(function(a, b){
            if( a[0] == b[0] ) return b[1] - a[1];
            else return a[0] - b[0];
        });


        //console.log('updating path');
        //svg.select("path").attr("d", line(points));
    }

    function change() {
        console.log(this.value);
        line.interpolate(this.value);
        redraw();
    }

    function mousedown() {
        points.push(selected = dragged = d3.mouse(svg.node()));
        sortpoints();
        redraw();
    }

    function pathPos( x )
    {
        var pathEl = svg.select("path").node();
        var pathLength = pathEl.getTotalLength();

        var svgcanvas = document.getElementById("rect");
        var offsetLeft = svgcanvas.getBoundingClientRect().left;
        var beginning = x, end = pathLength, target;
        var pos;
        while (true) {
            target = Math.floor((beginning + end) / 2);
            pos = pathEl.getPointAtLength(target);
            if ((target === end || target === beginning) && pos.x !== x) {
                break;
            }
            if (pos.x > x)      end = target;
            else if (pos.x < x) beginning = target;
            else                break; //position found
        }
        return pos;
    }

    function trackMouse()
    {
        var pathEl = svg.select("path").node();
        var pathLength = pathEl.getTotalLength();

        var svgcanvas = document.getElementById("rect");
        var offsetLeft = svgcanvas.getBoundingClientRect().left;
        var x = d3.event.pageX - offsetLeft;
        var beginning = x, end = pathLength, target;
        return pathPos( x );
    }

    function mousemove() {
        if (!dragged)
        {
            //var pos = trackMouse();
            //console.log(pos);
            return;
        }

        var m = d3.mouse(svg.node());
        dragged[0] = Math.max(0, Math.min(width, m[0]));
        dragged[1] = Math.max(0, Math.min(height, m[1]));

        sortpoints();

        redraw();

        $(document).trigger('curvechanged');
    }

    function mouseup() {
        if (!dragged) return;
        mousemove();
        dragged = null;

        $(document).trigger('curvechanged');
    }

    function keydown() {
        if (!selected) return;
        switch (d3.event.keyCode) {
            case 8: // backspace
            case 46: { // delete
                var i = points.indexOf(selected);
                points.splice(i, 1);
                selected = points.length ? points[i > 0 ? i - 1 : 0] : null;
                redraw();
                break;
            }
        }
    }
}
